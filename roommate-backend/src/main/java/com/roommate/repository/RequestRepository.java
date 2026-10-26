package com.roommate.repository;

import com.roommate.entity.RoomRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

// Repository interface for database queries on RoomRequest entries
@Repository
public interface RequestRepository extends JpaRepository<RoomRequest, Long> {

    boolean existsByRoomIdAndUserId(Long roomId, Long userId);

    List<RoomRequest> findByUserIdOrderByIdDesc(Long userId);

    List<RoomRequest> findByRoomOwnerIdOrderByIdDesc(Long ownerId);

    @Modifying
    @Transactional
    void deleteByRoomId(Long roomId);
}
