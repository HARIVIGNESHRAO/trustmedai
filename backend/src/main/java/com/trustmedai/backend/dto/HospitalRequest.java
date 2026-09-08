package com.trustmedai.backend.dto;

import java.util.List;

public class HospitalRequest {

    private String locality;

    private List<String> diseases;

    public String getLocality() {
        return locality;
    }

    public void setLocality(
            String locality
    ) {
        this.locality = locality;
    }

    public List<String> getDiseases() {
        return diseases;
    }

    public void setDiseases(
            List<String> diseases
    ) {
        this.diseases = diseases;
    }
}