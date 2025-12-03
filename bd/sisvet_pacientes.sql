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
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacientes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_propietario` bigint(20) unsigned NOT NULL,
  `id_doctor` bigint(20) unsigned NOT NULL,
  `id_usuario` bigint(20) unsigned NOT NULL,
  `id_raza` smallint(5) unsigned NOT NULL,
  `nombre_mascota` varchar(50) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `estado` enum('activo','fallecido','inactivo') DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_propietario` (`id_propietario`),
  KEY `id_doctor` (`id_doctor`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_raza` (`id_raza`),
  KEY `idx_nombre_mascota` (`nombre_mascota`),
  CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`id_propietario`) REFERENCES `propietarios` (`id`),
  CONSTRAINT `pacientes_ibfk_2` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id`),
  CONSTRAINT `pacientes_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `pacientes_ibfk_4` FOREIGN KEY (`id_raza`) REFERENCES `razas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (1,1,1,1,1,'Max','2020-03-15',30.50,NULL,'activo','2025-01-04 16:19:43','2025-01-04 16:19:43'),(2,1,1,1,6,'Luna','2021-06-20',4.20,NULL,'activo','2025-01-04 16:19:43','2025-01-04 16:19:43'),(3,2,2,2,2,'Rocky','2019-12-10',32.10,NULL,'activo','2025-01-04 16:19:43','2025-01-04 16:19:43'),(4,3,3,3,3,'Thor','2021-02-28',35.60,NULL,'activo','2025-01-04 16:19:43','2025-01-04 16:19:43'),(5,3,3,3,7,'Mimi','2022-01-15',3.80,NULL,'activo','2025-01-04 16:19:43','2025-01-04 16:19:43'),(6,4,4,4,4,'Kiki','2020-07-05',2.30,NULL,'activo','2025-01-04 16:19:43','2025-01-04 16:19:43'),(7,5,5,5,5,'Bruno','2021-09-18',12.40,NULL,'activo','2025-01-04 16:19:43','2025-01-04 16:19:43'),(8,6,1,1,8,'Felix','2020-11-30',4.50,NULL,'activo','2025-01-04 16:19:43','2025-01-04 16:19:43'),(9,7,2,2,1,'Toby','2021-04-22',28.70,NULL,'activo','2025-01-04 16:19:43','2025-01-04 16:19:43'),(10,7,2,2,9,'Nala','2022-03-10',3.90,NULL,'activo','2025-01-04 16:19:43','2025-01-04 16:19:43'),(11,8,3,3,2,'Zeus','2020-08-14',33.20,NULL,'activo','2025-01-04 16:19:43','2025-01-04 16:19:43'),(13,11,1,1,10,'Ambrosio','2025-10-14',3.00,NULL,'activo','2025-08-08 16:24:05','2025-10-24 00:09:00'),(19,11,1,1,11,'Molly','1991-01-13',6.00,NULL,'activo','2025-10-17 17:57:33','2025-10-17 17:57:33'),(20,11,1,1,11,'Markov','2015-07-13',7.00,NULL,'activo','2025-10-17 17:59:54','2025-10-17 17:59:54'),(21,11,1,1,11,'Yui','2017-05-15',6.00,NULL,'activo','2025-10-17 18:39:05','2025-10-17 18:39:05'),(22,11,1,1,11,'Forest','2017-05-15',7.00,NULL,'activo','2025-10-17 18:40:21','2025-10-17 18:40:21'),(23,14,1,1,5,'Murci','2010-01-01',6.90,NULL,'activo','2025-10-17 20:39:25','2025-10-20 15:38:42'),(25,15,1,1,5,'Zura','2007-01-01',7.90,NULL,'activo','2025-11-24 19:33:32','2025-11-24 19:33:32');
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03 13:22:22
