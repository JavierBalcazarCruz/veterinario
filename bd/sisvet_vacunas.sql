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
-- Table structure for table `vacunas`
--

DROP TABLE IF EXISTS `vacunas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vacunas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint(20) unsigned NOT NULL,
  `id_historia_clinica` bigint(20) unsigned NOT NULL,
  `tipo_vacuna` varchar(100) NOT NULL,
  `fecha_aplicacion` date NOT NULL,
  `fecha_proxima` date DEFAULT NULL,
  `lote_vacuna` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_historia_clinica` (`id_historia_clinica`),
  KEY `idx_paciente_fecha` (`id_paciente`,`fecha_aplicacion`),
  KEY `idx_proxima` (`fecha_proxima`),
  CONSTRAINT `vacunas_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `vacunas_ibfk_2` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historias_clinicas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vacunas`
--

LOCK TABLES `vacunas` WRITE;
/*!40000 ALTER TABLE `vacunas` DISABLE KEYS */;
INSERT INTO `vacunas` VALUES (1,1,1,'Polivalente','2024-01-02','2024-07-02','LOT123','2025-01-04 16:19:43','2025-01-04 16:19:43'),(2,2,2,'Triple Felina','2024-01-02','2024-07-02','LOT124','2025-01-04 16:19:43','2025-01-04 16:19:43'),(3,3,3,'Rabia','2024-01-02','2025-01-02','LOT125','2025-01-04 16:19:43','2025-01-04 16:19:43'),(4,4,4,'Parvovirus','2024-01-02','2024-07-02','LOT126','2025-01-04 16:19:43','2025-01-04 16:19:43'),(5,5,5,'Leucemia Felina','2024-01-02','2024-07-02','LOT127','2025-01-04 16:19:43','2025-01-04 16:19:43');
/*!40000 ALTER TABLE `vacunas` ENABLE KEYS */;
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
