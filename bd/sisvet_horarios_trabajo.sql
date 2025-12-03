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
-- Table structure for table `horarios_trabajo`
--

DROP TABLE IF EXISTS `horarios_trabajo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horarios_trabajo` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_doctor` bigint(20) unsigned DEFAULT NULL COMMENT 'NULL = aplica a todos',
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `tipo` enum('medico','estetica','ambos') DEFAULT 'ambos',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_doctor` (`id_doctor`),
  KEY `idx_dia` (`dia_semana`),
  CONSTRAINT `fk_horarios_doctor` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Horarios de trabajo de doctores/estilistas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios_trabajo`
--

LOCK TABLES `horarios_trabajo` WRITE;
/*!40000 ALTER TABLE `horarios_trabajo` DISABLE KEYS */;
INSERT INTO `horarios_trabajo` VALUES (1,NULL,'lunes','08:00:00','18:00:00','ambos',1,'2025-10-30 18:25:08','2025-10-30 18:25:08'),(2,NULL,'martes','08:00:00','18:00:00','ambos',1,'2025-10-30 18:25:08','2025-10-30 18:25:08'),(3,NULL,'miercoles','08:00:00','18:00:00','ambos',1,'2025-10-30 18:25:08','2025-10-30 18:25:08'),(4,NULL,'jueves','08:00:00','18:00:00','ambos',1,'2025-10-30 18:25:08','2025-10-30 18:25:08'),(5,NULL,'viernes','08:00:00','18:00:00','ambos',1,'2025-10-30 18:25:08','2025-10-30 18:25:08'),(6,NULL,'sabado','09:00:00','14:00:00','ambos',1,'2025-10-30 18:25:08','2025-10-30 18:25:08');
/*!40000 ALTER TABLE `horarios_trabajo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03 13:22:17
