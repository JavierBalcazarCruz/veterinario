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
-- Table structure for table `examenes_laboratorio`
--

DROP TABLE IF EXISTS `examenes_laboratorio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examenes_laboratorio` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint(20) unsigned NOT NULL,
  `id_historia_clinica` bigint(20) unsigned NOT NULL,
  `tipo_examen` enum('hemograma','bioquimica','urinalisis','parasitologia','microbiologia','otro') NOT NULL,
  `nombre_examen` varchar(200) NOT NULL,
  `fecha_solicitud` date NOT NULL,
  `fecha_resultado` date DEFAULT NULL,
  `laboratorio` varchar(100) DEFAULT NULL,
  `resultados` text DEFAULT NULL,
  `interpretacion` text DEFAULT NULL,
  `valores_referencia` text DEFAULT NULL,
  `estado` enum('solicitado','en_proceso','completado','cancelado') DEFAULT 'solicitado',
  `archivo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_historia_clinica` (`id_historia_clinica`),
  KEY `idx_tipo` (`tipo_examen`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `examenes_laboratorio_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `examenes_laboratorio_ibfk_2` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historias_clinicas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de exámenes de laboratorio solicitados y resultados';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examenes_laboratorio`
--

LOCK TABLES `examenes_laboratorio` WRITE;
/*!40000 ALTER TABLE `examenes_laboratorio` DISABLE KEYS */;
INSERT INTO `examenes_laboratorio` VALUES (1,13,1,'hemograma','Hemograma completo','2025-10-22',NULL,NULL,NULL,NULL,NULL,'solicitado',NULL,'2025-10-22 13:03:44','2025-10-22 13:03:44');
/*!40000 ALTER TABLE `examenes_laboratorio` ENABLE KEYS */;
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
