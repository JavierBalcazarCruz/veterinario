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
-- Table structure for table `direcciones`
--

DROP TABLE IF EXISTS `direcciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direcciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_propietario` bigint(20) unsigned NOT NULL,
  `tipo` enum('casa','trabajo') NOT NULL,
  `calle` varchar(100) NOT NULL,
  `numero_ext` varchar(20) NOT NULL,
  `numero_int` varchar(20) DEFAULT NULL,
  `id_codigo_postal` int(10) unsigned NOT NULL,
  `referencias` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_propietario` (`id_propietario`),
  KEY `id_codigo_postal` (`id_codigo_postal`),
  CONSTRAINT `direcciones_ibfk_1` FOREIGN KEY (`id_propietario`) REFERENCES `propietarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `direcciones_ibfk_2` FOREIGN KEY (`id_codigo_postal`) REFERENCES `codigo_postal` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direcciones`
--

LOCK TABLES `direcciones` WRITE;
/*!40000 ALTER TABLE `direcciones` DISABLE KEYS */;
INSERT INTO `direcciones` VALUES (1,1,'casa','Av. Principal','123','4B',9,'Frente al parque'),(2,2,'casa','Calle Insurgentes','4567',NULL,2,'Esquina con Reforma'),(3,3,'casa','Av. Revolución','789',NULL,3,'A un lado del mercado'),(4,4,'casa','Calle Durango','321',NULL,4,'Edificio azul'),(5,5,'casa','Av. Coyoacán','654',NULL,5,'Casa blanca de dos pisos'),(6,11,'casa','Av. Principal','123','4B',9,NULL),(8,13,'casa','circuito  acequia real','4',NULL,10,'Farmacia similar'),(9,6,'casa','Av. Principal','123','4B',9,NULL),(10,14,'casa','Asturias','121',NULL,6,NULL),(11,15,'casa','Asturias','121',NULL,6,NULL);
/*!40000 ALTER TABLE `direcciones` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03 13:22:21
