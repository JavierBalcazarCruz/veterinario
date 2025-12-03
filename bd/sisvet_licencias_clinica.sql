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
-- Table structure for table `licencias_clinica`
--

DROP TABLE IF EXISTS `licencias_clinica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `licencias_clinica` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre_clinica` varchar(100) NOT NULL,
  `status` enum('activa','suspendida','cancelada','free') DEFAULT 'activa',
  `fecha_inicio` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `ultimo_pago` date DEFAULT NULL,
  `monto_mensual` decimal(10,2) DEFAULT NULL,
  `dias_gracia` int(11) DEFAULT 5,
  `notas` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `licencias_clinica`
--

LOCK TABLES `licencias_clinica` WRITE;
/*!40000 ALTER TABLE `licencias_clinica` DISABLE KEYS */;
INSERT INTO `licencias_clinica` VALUES (1,'Veterinaria San Francisco','activa','2025-01-01','2025-02-01',NULL,1500.00,5,NULL,'2025-01-04 16:19:42','2025-01-04 16:19:42'),(2,'Pet Care Center','activa','2025-01-01','2025-02-01',NULL,2000.00,5,NULL,'2025-01-04 16:19:42','2025-01-04 16:19:42'),(3,'Hospital Veterinario Luna','activa','2025-01-01','2025-02-01',NULL,1800.00,5,NULL,'2025-01-04 16:19:42','2025-01-04 16:19:42'),(4,'Clínica Veterinaria El Sol','activa','2025-01-01','2025-02-01',NULL,1500.00,5,NULL,'2025-01-04 16:19:42','2025-01-04 16:19:42'),(5,'Centro Veterinario Huellitas','suspendida','2025-01-01','2025-01-15',NULL,1500.00,5,NULL,'2025-01-04 16:19:42','2025-01-04 16:19:42'),(6,'Animal Health Center','activa','2025-01-01','2025-02-01',NULL,2500.00,5,NULL,'2025-01-04 16:19:42','2025-01-04 16:19:42'),(7,'Veterinaria Happy Pets','activa','2025-01-01','2025-02-01',NULL,1700.00,5,NULL,'2025-01-04 16:19:42','2025-01-04 16:19:42'),(8,'Centro Médico Veterinario Norte','activa','2025-01-01','2025-02-01',NULL,1900.00,5,NULL,'2025-01-04 16:19:42','2025-01-04 16:19:42'),(9,'Pet Hospital Express','cancelada','2025-01-01','2025-01-10',NULL,1500.00,5,NULL,'2025-01-04 16:19:42','2025-01-04 16:19:42'),(10,'Veterinaria Central','activa','2025-01-01','2025-02-01',NULL,2100.00,5,NULL,'2025-01-04 16:19:42','2025-01-04 16:19:42'),(11,'Licencia Gratuita MollyVet','free','2025-01-01','2026-12-31',NULL,0.00,30,'Licencia gratuita para desarrollo y pruebas','2025-08-05 15:03:22','2025-08-05 15:03:22');
/*!40000 ALTER TABLE `licencias_clinica` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03 13:22:20
