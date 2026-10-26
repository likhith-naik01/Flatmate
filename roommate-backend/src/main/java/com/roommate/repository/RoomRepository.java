package com.roommate.repository;

import com.roommate.entity.Room;
import com.roommate.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

// Repository interface for database queries on Room listings
@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    @Query("SELECT r FROM Room r WHERE (:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND (:maxRent IS NULL OR r.rent <= :maxRent) AND (:roomType IS NULL OR r.roomType = :roomType) ORDER BY r.id DESC")
    List<Room> searchRooms(
            @Param("location") String location,
            @Param("maxRent") Integer maxRent,
            @Param("roomType") RoomType roomType
    );

    List<Room> findByOwnerIdOrderByIdDesc(Long ownerId);
}
