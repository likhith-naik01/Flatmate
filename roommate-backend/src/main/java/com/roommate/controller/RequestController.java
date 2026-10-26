package com.roommate.controller;

import com.roommate.entity.RoomRequest;
import com.roommate.service.RequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

// REST controller managing tenant inquiries and owner decision workflows (accept/reject)
@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    public ResponseEntity<RoomRequest> createRequest(
            @RequestBody Map<String, Object> payload,
            @RequestHeader("X-User-Id") Long currentUserId
    ) {
        Object roomIdObj = payload.get("roomId");
        Long roomId = null;
        if (roomIdObj instanceof Number) {
            roomId = ((Number) roomIdObj).longValue();
        } else if (roomIdObj != null) {
            roomId = Long.parseLong(roomIdObj.toString().trim());
        }

        RoomRequest created = requestService.createRequest(roomId, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/sent")
    public ResponseEntity<List<RoomRequest>> getSentRequests(@RequestHeader("X-User-Id") Long currentUserId) {
        List<RoomRequest> sent = requestService.getSentRequests(currentUserId);
        return ResponseEntity.ok(sent);
    }

    @GetMapping("/received")
    public ResponseEntity<List<RoomRequest>> getReceivedRequests(@RequestHeader("X-User-Id") Long currentUserId) {
        List<RoomRequest> received = requestService.getReceivedRequests(currentUserId);
        return ResponseEntity.ok(received);
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<RoomRequest> acceptRequest(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long currentUserId
    ) {
        RoomRequest updated = requestService.acceptRequest(id, currentUserId);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<RoomRequest> rejectRequest(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long currentUserId
    ) {
        RoomRequest updated = requestService.rejectRequest(id, currentUserId);
        return ResponseEntity.ok(updated);
    }
}
