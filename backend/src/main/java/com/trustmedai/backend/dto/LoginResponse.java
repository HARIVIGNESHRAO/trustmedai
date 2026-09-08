package com.trustmedai.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.Data;
@Getter
@Setter
@Data
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String message;
    private String role;
}