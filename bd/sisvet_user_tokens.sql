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
-- Table structure for table `user_tokens`
--

DROP TABLE IF EXISTS `user_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint(20) unsigned NOT NULL,
  `token_type` enum('verification','reset','2fa') NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_token` (`token_hash`),
  CONSTRAINT `user_tokens_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_tokens`
--

LOCK TABLES `user_tokens` WRITE;
/*!40000 ALTER TABLE `user_tokens` DISABLE KEYS */;
INSERT INTO `user_tokens` VALUES (2,12,'verification','1ilv00rdm1t3pa8dplmo','2025-03-11 03:01:51','2025-03-10 23:39:48','2025-03-10 03:01:51'),(7,10,'reset','1j1takah2k6glie9pbr','2025-08-06 14:37:09','2025-08-05 14:37:56','2025-08-05 14:37:09'),(8,13,'verification','1j1tc5dalcevh6pkjplo','2025-08-06 15:03:57','2025-08-05 15:04:49','2025-08-05 15:03:57'),(9,1,'reset','1j2564psu8gbhq82508','2025-08-09 15:52:41','2025-08-08 15:52:47','2025-08-08 15:52:41'),(10,1,'reset','1j2564vdsrb7k262o4c8','2025-08-09 15:52:47','2025-08-08 15:53:06','2025-08-08 15:52:47'),(11,14,'verification','1j2aglo4hv1rr599unlo','2025-08-11 17:32:54','2025-08-10 17:33:24','2025-08-10 17:32:54'),(12,15,'verification','1j2bh0ra5i2tre0gccl','2025-08-12 02:58:12','2025-08-11 02:59:14','2025-08-11 02:58:12'),(13,16,'verification','1j2blje6bl3qjdmb7ht','2025-08-12 04:18:16','2025-08-11 04:18:54','2025-08-11 04:18:16'),(14,17,'verification','1j2bmh0vjhpc85f7jfq','2025-08-12 04:34:25','2025-08-11 04:34:46','2025-08-11 04:34:25'),(15,18,'verification','1j2bn04a99cclvvcj7','2025-08-12 04:42:40','2025-08-11 04:43:01','2025-08-11 04:42:40'),(16,19,'verification','1j2bnao3nimf2qokbup8','2025-08-12 04:48:28','2025-08-11 04:49:42','2025-08-11 04:48:28'),(17,20,'verification','1j2cicc0dte7llk2pv9','2025-08-12 12:41:13','2025-08-11 12:41:58','2025-08-11 12:41:13'),(18,21,'verification','1j2cjb9stniivjes2gf8','2025-08-12 12:58:07','2025-08-11 12:58:31','2025-08-11 12:58:07'),(19,1,'reset','1jarlb0m8pf0uavg21f8','2025-11-24 19:29:07','2025-11-24 19:29:07','2025-11-24 19:27:05'),(20,1,'reset','1jbdh2a2n7lgeq1p7h18','2025-12-01 17:59:23','2025-12-01 17:59:23','2025-12-01 17:58:46');
/*!40000 ALTER TABLE `user_tokens` ENABLE KEYS */;
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
