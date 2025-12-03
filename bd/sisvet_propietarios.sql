-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: sisvet
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `propietarios`
--

DROP TABLE IF EXISTS `propietarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `propietarios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `propietarios`
--

LOCK TABLES `propietarios` WRITE;
/*!40000 ALTER TABLE `propietarios` DISABLE KEYS */;
INSERT INTO `propietarios` VALUES (1,'Javier','Balcazar Cruz','javierbalcazarcruz@gmail.com','2025-01-04 16:19:43','2025-10-17 19:48:07'),(2,'Roberto','Martínez Ruiz','roberto.martinez@email.com','2025-01-04 16:19:43','2025-01-04 16:19:43'),(3,'Carmen','López Sánchez','carmen.lopez@email.com','2025-01-04 16:19:43','2025-01-04 16:19:43'),(4,'José','Rodríguez Flores','jose.rodriguez@email.com','2025-01-04 16:19:43','2025-01-04 16:19:43'),(5,'María','Sánchez Vega','maria.sanchez@email.com','2025-01-04 16:19:43','2025-01-04 16:19:43'),(6,'Javier','Balcazar Cruz','javierbalcazarcruz@gmail.com','2025-01-04 16:19:43','2025-10-17 19:28:21'),(7,'Laura','Díaz Mendoza','laura.diaz@email.com','2025-01-04 16:19:43','2025-01-04 16:19:43'),(8,'Miguel','Hernández Castro','miguel.hernandez@email.com','2025-01-04 16:19:43','2025-01-04 16:19:43'),(9,'Isabel','Torres Medina','isabel.torres@email.com','2025-01-04 16:19:43','2025-01-04 16:19:43'),(10,'Francisco','Ramírez Ortiz','francisco.ramirez@email.com','2025-01-04 16:19:43','2025-01-04 16:19:43'),(11,'Javier','Balcazar Cruz','javierbalcazarcruz@gmail.com','2025-01-04 16:22:05','2025-10-17 17:57:33'),(13,'Frida','Balcazar Vaca','frida@gmail.com','2025-10-14 18:11:57','2025-10-17 20:43:03'),(14,'Ivonne','Vaca Armenta','ivonnevaca89@gmail.com','2025-10-20 13:09:20','2025-10-20 13:09:20'),(15,'Ivonne','Vaca Armenta','ivonnevaca89@gmail.com','2025-11-24 19:33:32','2025-11-24 19:33:32');
/*!40000 ALTER TABLE `propietarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03 13:22:21
