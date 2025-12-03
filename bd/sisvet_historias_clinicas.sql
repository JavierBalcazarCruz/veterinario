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
-- Table structure for table `historias_clinicas`
--

DROP TABLE IF EXISTS `historias_clinicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historias_clinicas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint(20) unsigned NOT NULL,
  `id_doctor` bigint(20) unsigned NOT NULL,
  `fecha_consulta` datetime NOT NULL,
  `motivo_consulta` text NOT NULL,
  `diagnostico` text DEFAULT NULL,
  `tratamiento` text DEFAULT NULL,
  `peso_actual` decimal(5,2) DEFAULT NULL,
  `temperatura` decimal(3,1) DEFAULT NULL,
  `frecuencia_cardiaca` int(11) DEFAULT NULL COMMENT 'Latidos por minuto',
  `frecuencia_respiratoria` int(11) DEFAULT NULL COMMENT 'Respiraciones por minuto',
  `presion_arterial` varchar(20) DEFAULT NULL COMMENT 'Ejemplo: 120/80',
  `tiempo_llenado_capilar` decimal(3,1) DEFAULT NULL COMMENT 'Segundos',
  `nivel_dolor` tinyint(4) DEFAULT NULL COMMENT 'Escala 0-10',
  `condicion_corporal` enum('muy_delgado','delgado','ideal','sobrepeso','obeso') DEFAULT NULL,
  `estado_hidratacion` enum('normal','leve','moderada','severa') DEFAULT NULL COMMENT 'Nivel de deshidratación',
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_doctor` (`id_doctor`),
  KEY `idx_fecha_consulta` (`fecha_consulta`),
  KEY `idx_paciente_fecha` (`id_paciente`,`fecha_consulta`),
  CONSTRAINT `historias_clinicas_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `historias_clinicas_ibfk_2` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historias_clinicas`
--

LOCK TABLES `historias_clinicas` WRITE;
/*!40000 ALTER TABLE `historias_clinicas` DISABLE KEYS */;
INSERT INTO `historias_clinicas` VALUES (1,1,1,'2024-01-02 10:00:00','Revisión general','Estado saludable','Continuar con dieta actual',30.50,38.5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Ninguna observación adicional','2025-01-04 16:19:43','2025-01-04 16:19:43'),(2,2,2,'2024-01-02 11:00:00','Vacunación','Requiere refuerzo','Aplicación de vacuna',4.20,38.2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Próxima vacuna en 6 meses','2025-01-04 16:19:43','2025-01-04 16:19:43'),(3,3,3,'2024-01-02 12:00:00','Problemas digestivos','Gastritis leve','Dieta blanda y medicamento',32.10,38.7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Seguimiento en 1 semana','2025-01-04 16:19:43','2025-01-04 16:19:43'),(4,4,4,'2024-01-02 13:00:00','Control rutinario','Estado óptimo','Mantener cuidados actuales',35.60,38.4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Próximo control en 3 meses','2025-01-04 16:19:43','2025-01-04 16:19:43'),(5,5,5,'2024-01-02 14:00:00','Desparasitación','Requiere desparasitante','Aplicación de desparasitante',3.80,38.3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Repetir en 3 meses','2025-01-04 16:19:43','2025-01-04 16:19:43');
/*!40000 ALTER TABLE `historias_clinicas` ENABLE KEYS */;
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
