package com.trustmedai.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtp(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom("harivigneshrao151@gmail.com");  // ← Important
            message.setTo(email);
            message.setSubject("TrustMedAI Password Reset OTP");
            message.setText("Your OTP is: " + otp +
                    "\n\nIt is valid for 5 minutes.\n\nDo not share this OTP.");

            mailSender.send(message);

            System.out.println("✅ OTP Email sent successfully to: " + email);

        } catch (MailException e) {
            System.err.println("❌ Failed to send OTP email to: " + email);
            e.printStackTrace();   // This will show the exact error
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }
}