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
-- Temporary view structure for view `vista_historial_completo`
--

DROP TABLE IF EXISTS `vista_historial_completo`;
/*!50001 DROP VIEW IF EXISTS `vista_historial_completo`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_historial_completo` AS SELECT 
 1 AS `paciente_id`,
 1 AS `nombre_mascota`,
 1 AS `tipo_registro`,
 1 AS `registro_id`,
 1 AS `fecha`,
 1 AS `descripcion`,
 1 AS `veterinario`,
 1 AS `diagnostico`,
 1 AS `tratamiento`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_alergias_activas`
--

DROP TABLE IF EXISTS `vista_alergias_activas`;
/*!50001 DROP VIEW IF EXISTS `vista_alergias_activas`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_alergias_activas` AS SELECT 
 1 AS `paciente_id`,
 1 AS `nombre_mascota`,
 1 AS `tipo_alergia`,
 1 AS `nombre_alergeno`,
 1 AS `severidad`,
 1 AS `sintomas`,
 1 AS `fecha_deteccion`,
 1 AS `propietario`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vista_historial_completo`
--

/*!50001 DROP VIEW IF EXISTS `vista_historial_completo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_historial_completo` AS select `p`.`id` AS `paciente_id`,`p`.`nombre_mascota` AS `nombre_mascota`,'consulta' AS `tipo_registro`,`hc`.`id` AS `registro_id`,`hc`.`fecha_consulta` AS `fecha`,`hc`.`motivo_consulta` AS `descripcion`,concat(`u`.`nombre`,' ',`u`.`apellidos`) AS `veterinario`,`hc`.`diagnostico` AS `diagnostico`,`hc`.`tratamiento` AS `tratamiento` from (((`pacientes` `p` join `historias_clinicas` `hc` on(`p`.`id` = `hc`.`id_paciente`)) join `doctores` `d` on(`hc`.`id_doctor` = `d`.`id`)) join `usuarios` `u` on(`d`.`id_usuario` = `u`.`id`)) where `p`.`estado` = 'activo' union all select `p`.`id` AS `paciente_id`,`p`.`nombre_mascota` AS `nombre_mascota`,'vacuna' AS `tipo_registro`,`v`.`id` AS `registro_id`,`v`.`fecha_aplicacion` AS `fecha`,concat('Vacuna: ',`v`.`tipo_vacuna`) AS `descripcion`,NULL AS `veterinario`,NULL AS `diagnostico`,concat('Próxima: ',ifnull(`v`.`fecha_proxima`,'No programada')) AS `tratamiento` from (`pacientes` `p` join `vacunas` `v` on(`p`.`id` = `v`.`id_paciente`)) where `p`.`estado` = 'activo' union all select `p`.`id` AS `paciente_id`,`p`.`nombre_mascota` AS `nombre_mascota`,'desparasitacion' AS `tipo_registro`,`dp`.`id` AS `registro_id`,`dp`.`fecha_aplicacion` AS `fecha`,concat('Desparasitación: ',`dp`.`producto`) AS `descripcion`,NULL AS `veterinario`,NULL AS `diagnostico`,concat('Próxima: ',ifnull(`dp`.`fecha_proxima`,'No programada')) AS `tratamiento` from (`pacientes` `p` join `desparasitaciones` `dp` on(`p`.`id` = `dp`.`id_paciente`)) where `p`.`estado` = 'activo' union all select `p`.`id` AS `paciente_id`,`p`.`nombre_mascota` AS `nombre_mascota`,'cirugia' AS `tipo_registro`,`cp`.`id` AS `registro_id`,`cp`.`fecha_realizacion` AS `fecha`,concat(case `cp`.`tipo` when 'cirugia' then 'Cirugía: ' when 'procedimiento' then 'Procedimiento: ' end,`cp`.`nombre`) AS `descripcion`,concat(`u`.`nombre`,' ',`u`.`apellidos`) AS `veterinario`,`cp`.`resultado` AS `diagnostico`,`cp`.`notas_postoperatorias` AS `tratamiento` from (((`pacientes` `p` join `cirugias_procedimientos` `cp` on(`p`.`id` = `cp`.`id_paciente`)) join `doctores` `d` on(`cp`.`id_doctor` = `d`.`id`)) join `usuarios` `u` on(`d`.`id_usuario` = `u`.`id`)) where `p`.`estado` = 'activo' order by `fecha` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_alergias_activas`
--

/*!50001 DROP VIEW IF EXISTS `vista_alergias_activas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_alergias_activas` AS select `p`.`id` AS `paciente_id`,`p`.`nombre_mascota` AS `nombre_mascota`,`a`.`tipo_alergia` AS `tipo_alergia`,`a`.`nombre_alergeno` AS `nombre_alergeno`,`a`.`severidad` AS `severidad`,`a`.`sintomas` AS `sintomas`,`a`.`fecha_deteccion` AS `fecha_deteccion`,concat(`pr`.`nombre`,' ',`pr`.`apellidos`) AS `propietario` from ((`pacientes` `p` join `alergias` `a` on(`p`.`id` = `a`.`id_paciente`)) join `propietarios` `pr` on(`p`.`id_propietario` = `pr`.`id`)) where `p`.`estado` = 'activo' and `a`.`activa` = 1 order by `a`.`severidad` desc,`p`.`nombre_mascota` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03 13:22:23
