package com.trustmedai.backend.controller;

import com.trustmedai.backend.service.EkaAppointmentService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/eka")
public class EkaAppointmentController {

    private final EkaAppointmentService ekaAppointmentService;

    public EkaAppointmentController(EkaAppointmentService ekaAppointmentService) {
        this.ekaAppointmentService = ekaAppointmentService;
    }

    @GetMapping("/doctors")
    public Object getDoctors() {
        return ekaAppointmentService.getBusinessEntities();
    }

    @GetMapping("/doctors/{doctorId}/clinics/{clinicId}/slots")
    public Object getSlots(@PathVariable String doctorId, @PathVariable String clinicId) {
        return ekaAppointmentService.getSlots(doctorId, clinicId);
    }

    @PostMapping("/appointments")
    public Object bookAppointment(@RequestBody Map<String, Object> request) {
        return ekaAppointmentService.bookAppointment(request);
    }
}
