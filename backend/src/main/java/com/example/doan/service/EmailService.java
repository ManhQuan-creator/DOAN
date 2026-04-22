package com.example.doan.service;

import com.example.doan.entity.Booking;
import com.example.doan.entity.Ticket;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mail;
    private final TemplateEngine tmpl;

    @Async
    public void sendConfirmation(Booking b)
    { send(b, "ticket-confirmation", "Booking Confirmed"); }
    @Async
    public void sendRejection(Booking b)
    { send(b, "ticket-rejection", "Booking Rejected"); }

    @Async
    public void sendPasswordReset(String toEmail, String userName, String newPassword) {
        if (toEmail == null || toEmail.isEmpty()) return;
        try {
            Context ctx = new Context();
            ctx.setVariable("userName", userName);
            ctx.setVariable("newPassword", newPassword);

            var msg = mail.createMimeMessage();
            var h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setTo(toEmail);
            h.setSubject("Đặt lại mật khẩu - Phiệt Học Bus");
            h.setText(tmpl.process("password-reset", ctx), true);
            mail.send(msg);
            log.info("Email đặt lại mật khẩu đã được gửi đến {}", toEmail);
        } catch (Exception e) {
            log.error("Email đặt lại mật khẩu không thành công. {}", toEmail, e);
        }
    }
//    @Async
//    public void senOtp(String toEmail,String userName,String otp,String purpose){
//        if(toEmail == null || toEmail.isEmpty()) return;
//        try{
//            Context ctx = new Context();
//            ctx.setVariable("userName", userName);
//            ctx.setVariable("otp", otp);
//            ctx.setVariable("purpose", purpose);
//            var msg = mail.createMimeMessage();
//            var h = new MimeMessageHelper(msg, true, "UTF-8");
//            h.setTo(toEmail);
//            h.setSubject("Mã Xác Thực OTP");
//            h.setText(tmpl.process("otp", ctx), true);
//            mail.send(msg);
//            log.info("OTP email gửi đến {} cho mục đích: {}",toEmail,purpose);
//        }catch(Exception e){
//            log.error("Gửi OTP Thất Bại: {}",toEmail,e);
//        }
//    }
     @Async
     public void sendPasswordChanged(String toEmail, String userName) {
         if (toEmail == null || toEmail.isEmpty()) return;
         try {
             Context ctx = new Context();
             ctx.setVariable("userName", userName);
             var msg = mail.createMimeMessage();
             var h = new MimeMessageHelper(msg, true, "UTF-8");
             h.setTo(toEmail);
             h.setSubject("Mật khẩu đã được thay đổi ");
             h.setText(tmpl.process("password-changed", ctx), true);
             mail.send(msg);
             log.info("Email thông báo đổi mật khẩu  {}", toEmail);
         } catch (Exception e) {
             log.error("Gửi email đổi mật khẩu thất bại: {}", toEmail, e);
         }
     }

    private void send(Booking b, String template, String subject) {
        String to = b.getUser() != null ? b.getUser().getEmail() : null;
        if (to == null || to.isEmpty()) return;

        String departure = "";
        String destination = "";
        String startTime = "";
        String bookingCode = b.getBookingCode();
        Long totalPrice = b.getTotalPrice();
        String dateStart = b.getDateStart();

        try {
            Ticket t = b.getTicket();
            if (t != null) {
                departure = t.getDeparture() != null ? t.getDeparture() : "";
                destination = t.getDestination() != null ? t.getDestination() : "";
                startTime = t.getStartTime() != null ? t.getStartTime() : "";
            }
        } catch (Exception e) {
            log.warn("Không thể tải vé để đặt chỗ {}", bookingCode);
        }

        try {
            Context ctx = new Context();
            ctx.setVariable("booking", b);
            ctx.setVariable("ticket", b.getTicket());
            ctx.setVariable("userPhone", b.getUser() != null ?
                    (b.getUser().getPhone() != null ? b.getUser().getPhone() : "Chưa cập nhật") : "");
            ctx.setVariable("userName", b.getUser() != null ? b.getUser().getName() : "");
            var msg = mail.createMimeMessage();
            var h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setTo(to);
            h.setSubject(subject + " - PhietHoc #" + b.getBookingCode());
            h.setText(tmpl.process(template, ctx), true);
            mail.send(msg);
        } catch (Exception e)
        { log.error("Email không gửi được{}", to, e); }
    }

    @Async
    public void sendOtp(String toEmail, String userName, String otp, String purpose) {
        if (toEmail == null || toEmail.isEmpty()) return;
        try {
            Context ctx = new Context();
            ctx.setVariable("userName", userName);
            ctx.setVariable("otp", otp);
            ctx.setVariable("purpose", purpose);

            var msg = mail.createMimeMessage();
            var h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setTo(toEmail);
            h.setSubject("Mã OTP");
            h.setText(tmpl.process("otp-email", ctx), true);
            mail.send(msg);
            log.info("Mã OTP được gửi qua email đến {}", toEmail);
        } catch (Exception e) {
            log.error("Mã OTP gửi qua email không thành công. {}", toEmail, e);
        }
    }

    public void sendContactEmail(String adminEmail, String fromName,
                                 String fromEmail, String subject, String message) {
        if (adminEmail == null || adminEmail.isEmpty()) return;

        log.info("Sending contact email to: {}", adminEmail);

        try {
            Context ctx = new Context();
            ctx.setVariable("fromName", fromName);
            ctx.setVariable("fromEmail", fromEmail);
            ctx.setVariable("subject", subject);
            ctx.setVariable("message", message);

            var msg = mail.createMimeMessage();
            var h = new MimeMessageHelper(msg, true, "UTF-8");

            h.setTo(adminEmail);
            h.setFrom("manhquan0415@gmail.com");
            h.setSubject("Chủ Đề " + subject);
            h.setText(tmpl.process("contact-email", ctx), true);

            mail.send(msg);
            log.info("Email liên hệ đã được gửi thành công đến {}", adminEmail);

        } catch (Exception e) {
            log.error("Không thể gửi email liên hệ: {}", e.getMessage(), e);
        }
    }

    @Async
    public void sendPaymentSuccess(Booking b) {
        String to = b.getUser() != null ? b.getUser().getEmail() : null;
        if (to == null || to.isEmpty()) return;
        try {
            Context ctx = new Context();
            ctx.setVariable("booking", b);
            ctx.setVariable("ticket", b.getTicket());
            ctx.setVariable("userPhone", b.getUser() != null ? b.getUser().getPhone() : "");
            var msg = mail.createMimeMessage();
            var h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setTo(to);
            h.setSubject("Thanh Toán Thành Công - PhietHoc #" + b.getBookingCode());
            h.setText(tmpl.process("ticket-confirmation", ctx), true);
            mail.send(msg);
        } catch (Exception e) {
            log.error("Failed to send payment success email", e);
        }
    }
}
