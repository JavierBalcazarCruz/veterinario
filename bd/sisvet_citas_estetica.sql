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
-- Table structure for table `citas_estetica`
--

DROP TABLE IF EXISTS `citas_estetica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas_estetica` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint(20) unsigned NOT NULL,
  `id_estilista` bigint(20) unsigned DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `tipo_servicio` enum('baño','corte','baño_corte','uñas','limpieza_dental','spa_premium','deslanado','tratamiento_pulgas','otro') NOT NULL DEFAULT 'baño',
  `estado` enum('programada','confirmada','en_proceso','completada','cancelada','no_asistio') NOT NULL DEFAULT 'programada',
  `estilo_corte` varchar(100) DEFAULT NULL COMMENT 'Descripción del estilo de corte preferido',
  `productos_usados` text DEFAULT NULL COMMENT 'Lista de productos utilizados en el servicio',
  `raza_especifica` varchar(50) DEFAULT NULL COMMENT 'Raza del paciente para referencia',
  `tamaño` enum('pequeño','mediano','grande','gigante') DEFAULT NULL,
  `duracion_estimada` int(11) DEFAULT 60 COMMENT 'Duración estimada en minutos',
  `duracion_real` int(11) DEFAULT NULL COMMENT 'Duración real del servicio en minutos',
  `precio` decimal(10,2) DEFAULT NULL,
  `notas` text DEFAULT NULL COMMENT 'Notas generales del cliente o estilista',
  `notas_comportamiento` text DEFAULT NULL COMMENT 'Comportamiento de la mascota durante el servicio',
  `foto_antes` varchar(255) DEFAULT NULL,
  `foto_despues` varchar(255) DEFAULT NULL,
  `motivo_cancelacion` text DEFAULT NULL,
  `confirmada_por_cliente` tinyint(1) DEFAULT 0,
  `fecha_confirmacion` timestamp NULL DEFAULT NULL,
  `recordatorio_enviado` tinyint(1) DEFAULT 0,
  `fecha_recordatorio` timestamp NULL DEFAULT NULL,
  `cliente_notificado_finalizacion` tinyint(1) DEFAULT 0 COMMENT 'Si se notificó al cliente que terminó el servicio',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_paciente` (`id_paciente`),
  KEY `idx_estilista` (`id_estilista`),
  KEY `idx_fecha_hora` (`fecha`,`hora`),
  KEY `idx_estado` (`estado`),
  KEY `idx_tipo_servicio` (`tipo_servicio`),
  KEY `idx_fecha_estado` (`fecha`,`estado`),
  CONSTRAINT `fk_citas_estetica_estilista` FOREIGN KEY (`id_estilista`) REFERENCES `doctores` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_citas_estetica_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla para gestionar citas de servicios de estética y grooming';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas_estetica`
--

LOCK TABLES `citas_estetica` WRITE;
/*!40000 ALTER TABLE `citas_estetica` DISABLE KEYS */;
INSERT INTO `citas_estetica` VALUES (1,13,NULL,'2025-11-01','08:00:00','baño','completada',NULL,NULL,'Bengalí',NULL,60,NULL,250.00,NULL,NULL,NULL,NULL,NULL,1,'2025-10-31 18:19:52',0,NULL,0,'2025-10-31 18:19:18','2025-10-31 18:19:59');
/*!40000 ALTER TABLE `citas_estetica` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03 13:22:19
