package com.roommate.controller;

import com.roommate.entity.Room;
import com.roommate.entity.RoomType;
import com.roommate.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

// REST controller exposing endpoints for searching, viewing, creating, updating, and deleting rooms
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public ResponseEntity<List<Room>> searchRooms(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer maxRent,
            @RequestParam(required = false) RoomType roomType
    ) {
        List<Room> rooms = roomService.searchRooms(location, maxRent, roomType);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        Room room = roomService.getRoomById(id);
        return ResponseEntity.ok(room);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Room>> getMyRooms(@RequestHeader("X-User-Id") Long currentUserId) {
        List<Room> myRooms = roomService.getMyRooms(currentUserId);
        return ResponseEntity.ok(myRooms);
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(
            @Valid @RequestBody Room room,
            @RequestHeader("X-User-Id") Long currentUserId
    ) {
        Room createdRoom = roomService.createRoom(room, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRoom);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody Room updatedRoom,
            @RequestHeader("X-User-Id") Long currentUserId
    ) {
        Room room = roomService.updateRoom(id, updatedRoom, currentUserId);
        return ResponseEntity.ok(room);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long currentUserId
    ) {
        roomService.deleteRoom(id, currentUserId);
        return ResponseEntity.noContent().build();
    }
}
