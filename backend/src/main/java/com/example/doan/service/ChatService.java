package com.example.doan.service;

import com.example.doan.dto.reponse.ChatMessageResponse;
import com.example.doan.dto.reponse.ChatResponse;
import com.example.doan.dto.request.CreateChatRequest;
import com.example.doan.entity.Chat;
import com.example.doan.entity.ChatMessage;
import com.example.doan.entity.User;
import com.example.doan.enums.Priority;
import com.example.doan.enums.SenderType;
import com.example.doan.exception.BadRequestException;
import com.example.doan.exception.ResourceNotFoundException;
import com.example.doan.repository.ChatMessageRepository;
import com.example.doan.repository.ChatRepository;
import com.example.doan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
public class ChatService {
    private final ChatRepository chatRepo;
    private final ChatMessageRepository msgRepo;
    private final UserRepository userRepo;
    private final SimpMessagingTemplate ws;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Transactional
    public ChatResponse create(Long uid, CreateChatRequest req) {
        User u = userRepo.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        Chat c = Chat.builder()
                .user(u)
                .description(req.getDescription())
                .priority(req.getPriority())
                .status(2)
                .build();
        chatRepo.save(c);
        ChatMessage m = ChatMessage
                .builder()
                .chat(c)
                .senderType(SenderType.USER)
                .message(req.getMessage())
                .build();
        msgRepo.save(m);
        c.setLastMessage(req.getMessage());
        chatRepo.save(c);
        return toFull(c);
    }

    public List<ChatResponse> userChats(Long uid) {
        return chatRepo.findByUserIdOrderByUpdatedAtDesc(uid)
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList()); }
    public List<ChatResponse> allChats() {
        return chatRepo.findAllByOrderByUpdatedAtDesc()
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList()); }

    public ChatResponse getChat(Long cid, Long uid) {
        Chat c = chatRepo.findById(cid)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin nhắn trò chuyện"));
        if (!c.getUser().getId().equals(uid)) {
            User req = userRepo.findById(uid)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
            if (!req.getRole().name().equals("ADMIN"))
                throw new BadRequestException("Không được phép");
        }
        return toFull(c);
    }

    @Transactional
    public ChatMessageResponse send(Long cid, Long uid, String text, boolean admin) {
        Chat c = chatRepo.findById(cid)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin nhắn trò chuyện"));
        ChatMessage m = ChatMessage
                .builder()
                .chat(c)
                .senderType(admin ? SenderType.ADMIN : SenderType.USER)
                .message(text)
                .build();
        msgRepo.save(m);
        c.setLastMessage(text);
        c.setStatus(admin ? 1 : 2);
        chatRepo.save(c);
        ChatMessageResponse r = toMsgRes(m);
        try {
            // gửi tn đến 2 phía
            ws.convertAndSend("/topic/chat/" + cid, (Object) r);

            Map<String, Object> chatStatusUpdate = new java.util.HashMap<>();
            chatStatusUpdate.put("chatId", cid);
            chatStatusUpdate.put("status", c.getStatus());
            chatStatusUpdate.put("statusName", c.getStatus() == 1 ? "Đã Phản Hồi" : "Chưa Phản Hồi");
            chatStatusUpdate.put("lastMessage", text);
            chatStatusUpdate.put("senderType", admin ? "ADMIN" : "USER");
            // Gửi đến topic riêng cho user của chat này
            ws.convertAndSend("/topic/chat/" + cid + "/status", (Object) chatStatusUpdate);

            if(!admin){
                Map<String, Object> payload = new java.util.HashMap<>();
                payload.put("chatId", cid);
                payload.put("message", text);
                payload.put("chatDescription", c.getDescription());
                payload.put("userName", c.getUser() != null ? c.getUser().getName() : "");

                ws.convertAndSend("/topic/admin/new-message", (Object) payload);
            }
        }
        catch (Exception e) { log.warn("WS failed"); }
        return r;
    }

    private ChatResponse toFull(Chat c) {
        List<ChatMessageResponse> msgs = c.getMessages()
                .stream()
                .map(this::toMsgRes)
                .collect(Collectors.toList());
        return build(c, msgs);
    }
    private ChatResponse toSummary(Chat c) {return build(c, null); }
    private ChatResponse build(Chat c, List<ChatMessageResponse> msgs) {
        String sn = c.getStatus() == 1 ? "Đã Phản Hồi" : "Chưa Phản Hồi";
        String pn;
        try { pn = Priority.fromValue(c.getPriority()).getDisplayName(); }
        catch (Exception e) { pn = "Không rõ"; }
        return ChatResponse
                .builder()
                .id(c.getId())
                .description(c.getDescription())
                .lastMessage(c.getLastMessage())
                .status(c.getStatus())
                .statusName(sn)
                .priority(c.getPriority())
                .priorityName(pn)
                .userName(c.getUser() != null ? c.getUser().getName() : "")
                .createdAt(c.getCreatedAt() != null ? c.getCreatedAt().format(FMT) : "")
                .updatedAt(c.getUpdatedAt() != null ? c.getUpdatedAt().format(FMT) : "")
               .messages(msgs)
                .build();
    }
    private ChatMessageResponse toMsgRes(ChatMessage m) {
        return ChatMessageResponse
                .builder()
                .id(m.getId())
                .senderType(m.getSenderType().name())
                .message(m.getMessage()).createdAt(m.getCreatedAt() != null ? m.getCreatedAt().format(FMT) : "")
                .build();
    }
    public ChatResponse getChatForAdmin(Long chatId) {
        Chat c = chatRepo.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin nhắn trò chuyện"));
        return toFull(c);  // trả về đầy đủ messages
    }
}