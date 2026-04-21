package com.example.waiting.repository;

import com.example.waiting.domain.WaitSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface WaitSettingRepository extends JpaRepository<WaitSetting, LocalDate> {
}
