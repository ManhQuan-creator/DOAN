import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon';
import { TicketService } from '../../../core/services/ticket';
import { AdminService } from '../../../core/services/admin';
import { Ticket, CreateTicketRequest, UpdateTicketRequest } from '../../../core/models/ticket';

@Component({
    selector: 'app-ticket-management',
    standalone: true,
    imports: [CommonModule, FormsModule, IconComponent],
    templateUrl: 'ticket-management.html'
})
export class TicketManagementComponent implements OnInit {
    tickets: Ticket[] = [];
    showCreateForm = false;
    isCreating = false;

     editingTicketId: number | null = null;
    isUpdating = false;
    editTicket: UpdateTicketRequest & { facilitiesStr?: string } = {};
    editFacilityInput = '';

    // create Form fields
    newTicket: CreateTicketRequest = {
        departure: '',
        destination: '',
        seatLayout: '2x2',
        type: 'AC',
        startTime: '',
        endTime: '',
        travelTime: '',
        offDay: '',
        facilities: [],
        seatsCount: 32
    };
    facilityInput = '';

    constructor(
        private ticketService: TicketService,
        private adminService: AdminService
    ) {}

    ngOnInit(): void {
        this.loadTickets();
    }

    loadTickets(): void {
        this.ticketService.getAll().subscribe({
            next: (r) => { this.tickets = r.data; }
        });
    }

    toggleCreateForm(): void {
        this.showCreateForm = !this.showCreateForm;
    }

    addFacility(): void {
        if (this.facilityInput.trim()) {
            if (!this.newTicket.facilities) this.newTicket.facilities = [];
            this.newTicket.facilities.push(this.facilityInput.trim());
            this.facilityInput = '';
        }
    }

    removeFacility(index: number): void {
        this.newTicket.facilities?.splice(index, 1);
    }

    createTicket(): void {
        if (!this.newTicket.departure || !this.newTicket.destination ||
            !this.newTicket.startTime || !this.newTicket.endTime) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        this.isCreating = true;
        this.adminService.createTicket(this.newTicket).subscribe({
            next: () => {
                alert('Tạo vé thành công!');
                this.loadTickets();
                this.showCreateForm = false;
                this.isCreating = false;
                this.resetForm();
            },
            error: (err) => {
                alert(err.error?.message || 'Tạo vé thất bại');
                this.isCreating = false;
            }
        });
    }
    private resetForm(): void {
        this.newTicket = {
            departure: '', destination: '', seatLayout: '2x2', type: 'AC',
            startTime: '', endTime: '', travelTime: '', offDay: '',
            facilities: [], seatsCount: 32
        };
        this.facilityInput = '';
    }

    //update
    updateTicket(ticket:Ticket):void{
        this.editingTicketId = ticket.id;
        this.showCreateForm = false;
        this.editTicket={
            departure: ticket.departure,
            destination: ticket.destination,
            seatLayout: ticket.seatLayout,
            type: ticket.type,
            startTime: ticket.startTime,
            endTime: ticket.endTime,
            travelTime: ticket.travelTime,
            offDay: ticket.offDay,
            facilities: ticket.facilities ? [...ticket.facilities]:[]
        };
        this.editFacilityInput='';
    }
     cancelEdit(): void {
        this.editingTicketId = null;
        this.editFacilityInput = '';
    }
 
    addEditFacility(): void {
        if (this.editFacilityInput.trim()) {
            if (!this.editTicket.facilities) this.editTicket.facilities = [];
            this.editTicket.facilities.push(this.editFacilityInput.trim());
            this.editFacilityInput = '';
        }
    }
 
    removeEditFacility(index: number): void {
        this.editTicket.facilities?.splice(index, 1);
    }
 
    saveEdit(id: number): void {
        if (!this.editTicket.departure || !this.editTicket.destination ||
            !this.editTicket.startTime || !this.editTicket.endTime) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        this.isUpdating = true;
        const payload: UpdateTicketRequest = {
            departure: this.editTicket.departure,
            destination: this.editTicket.destination,
            seatLayout: this.editTicket.seatLayout,
            type: this.editTicket.type,
            startTime: this.editTicket.startTime,
            endTime: this.editTicket.endTime,
            travelTime: this.editTicket.travelTime,
            offDay: this.editTicket.offDay,
            facilities: this.editTicket.facilities
        };
        this.adminService.updateTicket(id, payload).subscribe({
            next: () => {
                alert('Cập nhật vé thành công!');
                this.loadTickets();
                this.editingTicketId = null;
                this.isUpdating = false;
            },
            error: (err) => {
                alert(err.error?.message || 'Cập nhật thất bại');
                this.isUpdating = false;
            }
        });
    }

    deleteTicket(id: number): void {
        if (confirm('Bạn có chắc muốn xóa vé này?')) {
            this.adminService.deleteTicket(id).subscribe({
                next: () => {
                    this.tickets = this.tickets.filter(t => t.id !== id);
                    alert('Đã xóa vé');
                }
            });
        }
    }
  readonly DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
}