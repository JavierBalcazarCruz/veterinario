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
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `account_status` enum('active','suspended','pending') DEFAULT 'pending',
  `rol` enum('admin','doctor','recepcion','superadmin') NOT NULL,
  `id_licencia_clinica` bigint(20) unsigned NOT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` tinyint(3) unsigned DEFAULT 0,
  `password_reset_required` tinyint(1) DEFAULT 0,
  `two_factor_enabled` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `id_licencia_clinica` (`id_licencia_clinica`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_licencia_clinica`) REFERENCES `licencias_clinica` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Juan','García Pérez','juan.garcia@sanfrancisco.com','$2b$10$BmOxkpzsqPwtR/utuqx9XeEP2Lmo5dTiREId/5AMXCWILa/8HqPxa',NULL,'active','admin',1,'2025-12-01 17:59:30',0,0,0,'2025-01-04 16:19:43','2025-12-01 17:59:30'),(2,'María','López Rodríguez','maria.lopez@petcare.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPCYHEZ1UeKVW',NULL,'active','doctor',2,NULL,0,0,0,'2025-01-04 16:19:43','2025-01-04 16:19:43'),(3,'Carlos','Martínez Sánchez','carlos.martinez@lunah.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPCYHEZ1UeKVW',NULL,'active','doctor',3,NULL,0,0,0,'2025-01-04 16:19:43','2025-01-04 16:19:43'),(4,'Ana','Rodríguez Torres','ana.rodriguez@elsol.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPCYHEZ1UeKVW',NULL,'active','recepcion',4,NULL,0,0,0,'2025-01-04 16:19:43','2025-01-04 16:19:43'),(5,'Roberto','Hernández Luna','roberto.hernandez@huellitas.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPCYHEZ1UeKVW',NULL,'suspended','admin',5,NULL,0,0,0,'2025-01-04 16:19:43','2025-01-04 16:19:43'),(6,'Laura','González Flores','laura.gonzalez@animalhealth.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPCYHEZ1UeKVW',NULL,'active','doctor',6,NULL,0,0,0,'2025-01-04 16:19:43','2025-01-04 16:19:43'),(7,'Miguel','Díaz Castro','miguel.diaz@happypets.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPCYHEZ1UeKVW',NULL,'active','admin',7,NULL,0,0,0,'2025-01-04 16:19:43','2025-01-04 16:19:43'),(8,'Patricia','Sánchez Vega','patricia.sanchez@norte.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPCYHEZ1UeKVW',NULL,'active','doctor',8,NULL,0,0,0,'2025-01-04 16:19:43','2025-01-04 16:19:43'),(9,'José','Torres Ruiz','jose.torres@express.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPCYHEZ1UeKVW',NULL,'suspended','admin',9,NULL,0,0,0,'2025-01-04 16:19:43','2025-01-04 16:19:43'),(10,'Carmen','Flores Mora','carmen.flores@central.com','$2b$10$QETlrqZNvdWHw9hyIrD67ua3xiNcWZR7DB1JZZKLZFZk7ez3m/YmK',NULL,'active','doctor',10,'2025-10-06 20:57:37',0,0,0,'2025-01-04 16:19:43','2025-10-06 20:57:37'),(12,'Ivonne','Vaca Armenta','ivonnevaca@gmail.com','$2b$10$/OLtJVGCRcMlSoE8qjjYh.d1b1IWYWYx/XGAKGo4T3vAwVMtTWd92','2025-03-10 23:39:47','active','doctor',3,NULL,0,0,0,'2025-03-10 03:01:51','2025-03-10 23:39:47'),(13,'Javier','Balcazar Cruz','jbalcazarc@gmail.com','$2b$10$mJwoS5IRbGxti1wWEYU4yuatIhw/K1qCEJbEvtJfEUaV9MakoyiMO','2025-08-05 15:04:49','active','doctor',11,'2025-08-08 15:48:35',0,0,0,'2025-08-05 15:03:57','2025-08-08 15:48:35'),(14,'Javier','Balcazar Cruz','jbalcazar@gmail.com','$2b$10$qWYH49lW7YuOW..C9msC8exsdP1qOEiGY/FuMA03UHMmKUj6mlQ.W','2025-08-10 17:33:24','active','doctor',11,'2025-09-17 01:05:43',0,0,0,'2025-08-10 17:32:54','2025-09-17 01:05:43'),(15,'Javier','Balcazar Cruz','javierbalcazarcruz1@gmail.com','$2b$10$cr3ayIoqHk2c6kwLVcsnfev97K0IcPYrzsB/OfPXwA/TZAHKZaFQG','2025-08-11 02:59:14','active','doctor',11,NULL,0,0,0,'2025-08-11 02:58:12','2025-08-11 02:59:14'),(16,'Javier','Balcazar Cruz','javierbalcazarcruz2@gmail.com','$2b$10$.DBJaFiKUjYrz1f.zEwHb.VE7FxRDEwwWgPvR7D2vNY30Z67pAGnO','2025-08-11 04:18:54','active','doctor',11,NULL,0,0,0,'2025-08-11 04:18:16','2025-08-11 04:18:54'),(17,'Javier','Balcazar Cruz','javierbalcazarcruz3@gmail.com','$2b$10$lSR743wGnVb0YldA.CnlNeTuOQQo.//hjA/A3rhjVtvX67h5Oyc/q','2025-08-11 04:34:46','active','doctor',11,NULL,0,0,0,'2025-08-11 04:34:25','2025-08-11 04:34:46'),(18,'Javier','Balcazar Cruz','javierbalcazarcruz4@gmail.com','$2b$10$4HINmkPjBBFQH1eypxNdB.C3ldb9Dn3BCidV2TNDNsMzSoMwOjlbq','2025-08-11 04:43:01','active','doctor',11,NULL,0,0,0,'2025-08-11 04:42:40','2025-08-11 04:43:01'),(19,'Javier','Balcazar Cruz','javierbalcazarcruz5@gmail.com','$2b$10$1MEOujbQennJN86MzoL7vOmX41sPukq58h0qckYEDyhKEPOcJjasa','2025-08-11 04:49:42','active','doctor',11,NULL,0,0,0,'2025-08-11 04:48:28','2025-08-11 04:49:42'),(20,'Javier','Balcazar Cruz','javierbalcazarcruz6@gmail.com','$2b$10$03ZzcG8/OjfSvztRXI4w5.P9wnhdAISnVm0pPqLT.f05MV3LftnA.','2025-08-11 12:41:58','active','doctor',11,NULL,0,0,0,'2025-08-11 12:41:13','2025-08-11 12:41:58'),(21,'Javier','Balcazar Cruz','javierbalcazarcruz7@gmail.com','$2b$10$sxbeFAiiEqU2tYQA8kwt7uHqsW5A40S1RrRcE3PHrRTYogYL00MM.','2025-08-11 12:58:31','active','doctor',11,NULL,0,0,0,'2025-08-11 12:58:07','2025-08-11 12:58:31');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
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
