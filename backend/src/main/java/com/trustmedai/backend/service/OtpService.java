package com.trustmedai.backend.service;

import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final ConcurrentHashMap<String, String> otpStore = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> expiryStore = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Boolean> verifiedStore = new ConcurrentHashMap<>();

    public String generateOtp(String email) {
        String otp = String.valueOf(100000 + new Random().nextInt(900000));

        otpStore.put(email, otp);
        expiryStore.put(email, System.currentTimeMillis() + 5 * 60 * 1000); // 5 minutes
        verifiedStore.remove(email); // clear previous verification

        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        if (!otpStore.containsKey(email)) {
            return false;
        }

        // Check expiry
        if (System.currentTimeMillis() > expiryStore.get(email)) {
            removeOtp(email);
            return false;
        }

        boolean isValid = otpStore.get(email).equals(otp);

        return isValid;
    }

    public void markVerified(String email) {
        verifiedStore.put(email, true);
    }

    public boolean isVerified(String email) {
        return verifiedStore.getOrDefault(email, false);
    }

    public void removeOtp(String email) {
        otpStore.remove(email);
        expiryStore.remove(email);
        verifiedStore.remove(email);
    }

    public void clearVerification(String email) {
        verifiedStore.remove(email);
    }
}