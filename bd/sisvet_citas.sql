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
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint(20) unsigned NOT NULL,
  `id_doctor` bigint(20) unsigned NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `tipo_consulta` enum('primera_vez','seguimiento','urgencia','vacunacion') NOT NULL,
  `estado` enum('programada','confirmada','cancelada','completada','no_asistio','en_curso') DEFAULT 'programada',
  `notas` text DEFAULT NULL,
  `motivo_cancelacion` text DEFAULT NULL,
  `observaciones_finales` text DEFAULT NULL,
  `confirmada_por_cliente` tinyint(1) DEFAULT 0,
  `fecha_confirmacion` timestamp NULL DEFAULT NULL,
  `recordatorio_enviado` tinyint(1) DEFAULT 0,
  `fecha_recordatorio` timestamp NULL DEFAULT NULL,
  `duracion_minutos` int(11) DEFAULT 30,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_doctor` (`id_doctor`),
  KEY `idx_fecha` (`fecha`,`hora`),
  KEY `idx_citas_doctor_fecha` (`id_doctor`,`fecha`),
  KEY `idx_citas_paciente_fecha` (`id_paciente`,`fecha`),
  KEY `idx_citas_estado_fecha` (`estado`,`fecha`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES (1,13,1,'2025-10-31','14:00:00','seguimiento','programada','Seguimiento de salud',NULL,NULL,0,NULL,0,NULL,30,'2025-10-30 18:57:55','2025-10-30 18:57:55'),(2,13,1,'2025-10-31','08:00:00','seguimiento','programada','seguimiento',NULL,NULL,0,NULL,0,NULL,30,'2025-10-30 18:59:05','2025-10-30 18:59:05'),(3,25,1,'2025-11-25','17:30:00','primera_vez','programada',NULL,NULL,NULL,0,NULL,0,NULL,30,'2025-11-24 19:34:56','2025-11-24 19:34:56');
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03 13:22:18
