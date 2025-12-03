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
-- Table structure for table `cirugias_procedimientos`
--

DROP TABLE IF EXISTS `cirugias_procedimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cirugias_procedimientos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint(20) unsigned NOT NULL,
  `id_doctor` bigint(20) unsigned NOT NULL,
  `id_historia_clinica` bigint(20) unsigned DEFAULT NULL,
  `tipo` enum('cirugia','procedimiento') NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `fecha_realizacion` datetime NOT NULL,
  `duracion_minutos` int(11) DEFAULT NULL,
  `anestesia_utilizada` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `complicaciones` text DEFAULT NULL,
  `resultado` enum('exitoso','complicaciones','fallido') DEFAULT 'exitoso',
  `notas_postoperatorias` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_doctor` (`id_doctor`),
  KEY `id_historia_clinica` (`id_historia_clinica`),
  KEY `idx_fecha` (`fecha_realizacion`),
  CONSTRAINT `cirugias_procedimientos_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `cirugias_procedimientos_ibfk_2` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id`),
  CONSTRAINT `cirugias_procedimientos_ibfk_3` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historias_clinicas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de cirugías y procedimientos realizados';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cirugias_procedimientos`
--

LOCK TABLES `cirugias_procedimientos` WRITE;
/*!40000 ALTER TABLE `cirugias_procedimientos` DISABLE KEYS */;
INSERT INTO `cirugias_procedimientos` VALUES (1,13,1,NULL,'cirugia','Esterilización','2024-03-20 10:00:00',45,'Isoflurano','Ovariohisterectomía rutinaria',NULL,'exitoso',NULL,'2025-10-22 13:03:27','2025-10-22 13:03:27');
/*!40000 ALTER TABLE `cirugias_procedimientos` ENABLE KEYS */;
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
