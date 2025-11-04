import nodemailer from 'nodemailer';

/**
 * Helper para enviar email de recordatorio 24 horas antes de la cita
 * @param {Object} datos - Datos de la cita y paciente
 */
const emailRecordatorioCita = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const {
        email,
        nombre_propietario,
        nombre_mascota,
        fecha,
        hora,
        tipo,
        tipo_servicio,
        id_cita,
        direccion_clinica
    } = datos;

    // Formatear fecha
    const fechaObj = new Date(fecha);
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = fechaObj.toLocaleDateString('es-MX', opciones);

    // Calcular si es mañana
    const hoy = new Date();
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);
    const esMañana = fechaObj.toDateString() === mañana.toDateString();

    const esCitaMedica = tipo === 'medica';
    const icono = esCitaMedica ? '🏥' : '✨';
    const colorPrincipal = esCitaMedica ? '#FF7600' : '#9333EA';
    const tipoTexto = esCitaMedica ? 'Consulta Médica' : 'Servicio de Estética';

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recordatorio de Cita - MollyVet</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
    <center style="width: 100%; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto;">
            <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">

                <!-- Header con Alerta -->
                <tr>
                    <td style="background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%); text-align: center; padding: 30px 20px;">
                        <div style="background-color: rgba(255,255,255,0.3); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 48px; line-height: 80px;">⏰</span>
                        </div>
                        <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #78350F;">
                            Recordatorio de Cita
                        </h1>
                        <p style="margin: 10px 0 0; font-size: 16px; color: #78350F; font-weight: bold;">
                            ${esMañana ? '¡Tu cita es mañana!' : 'Tienes una cita próxima'}
                        </p>
                    </td>
                </tr>

                <!-- Main Content -->
                <tr>
                    <td style="background-color: #ffffff; padding: 40px 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

                            <!-- Saludo -->
                            <tr>
                                <td style="padding-bottom: 25px;">
                                    <h2 style="margin: 0; font-size: 22px; color: #333333;">
                                        Hola ${nombre_propietario} 👋
                                    </h2>
                                    <p style="margin: 15px 0 0; color: #666666; font-size: 16px; line-height: 24px;">
                                        Este es un recordatorio amigable de que <strong>${nombre_mascota}</strong> tiene una cita ${esMañana ? 'mañana' : 'próximamente'}.
                                    </p>
                                </td>
                            </tr>

                            <!-- Detalles Destacados -->
                            <tr>
                                <td style="background: linear-gradient(135deg, ${colorPrincipal} 0%, #e60d0d 100%); border-radius: 12px; padding: 30px; margin-bottom: 25px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                            <td style="text-align: center; padding-bottom: 20px;">
                                                <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                                    ${tipoTexto}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="text-align: center; padding-bottom: 10px;">
                                                <p style="margin: 0; font-size: 48px; color: #ffffff; font-weight: bold; line-height: 1.2;">
                                                    ${hora.substring(0, 5)}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="text-align: center;">
                                                <p style="margin: 0; color: #ffffff; font-size: 16px; line-height: 24px;">
                                                    ${fechaFormateada}
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Botón Principal -->
                            <tr>
                                <td style="padding: 25px 0;">
                                    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: auto;">
                                        <tr>
                                            <td style="border-radius: 50px; background: linear-gradient(-45deg, #10B981 0%, #059669 100%); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                                <a href="${process.env.FRONTEND_URL}/confirmar-cita/${id_cita}"
                                                   style="background: transparent; border-radius: 50px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 280px; text-transform: uppercase; letter-spacing: 0.5px;">
                                                    ✓ Confirmar Asistencia
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Información Adicional -->
                            <tr>
                                <td style="padding: 20px 0; border-top: 1px solid #e5e7eb;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                            <td style="padding: 15px 0; text-align: center;">
                                                <p style="margin: 0 0 5px 0; color: #6B7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                                    Ubicación
                                                </p>
                                                <p style="margin: 0; color: #374151; font-size: 15px;">
                                                    ${direccion_clinica || 'MollyVet - Clínica Veterinaria'}
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Consejos Útiles -->
                            <tr>
                                <td style="padding: 25px 0;">
                                    <div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 4px;">
                                        <p style="margin: 0 0 12px 0; color: #1E3A8A; font-size: 15px; font-weight: bold;">
                                            💡 Consejos para tu visita:
                                        </p>
                                        <ul style="margin: 0; padding-left: 20px; color: #1E40AF; font-size: 14px; line-height: 22px;">
                                            <li>Llega 10 minutos antes de tu cita</li>
                                            <li>Trae la cartilla de vacunación</li>
                                            ${esCitaMedica ? '<li>Si es posible, trae una muestra de heces reciente</li>' : '<li>Asegúrate de que tu mascota esté tranquila</li>'}
                                        </ul>
                                    </div>
                                </td>
                            </tr>

                            <!-- Opciones Secundarias -->
                            <tr>
                                <td style="padding: 20px 0; text-align: center;">
                                    <p style="margin: 0; font-size: 14px; color: #6B7280;">
                                        ¿Necesitas hacer cambios?
                                    </p>
                                    <p style="margin: 10px 0 0;">
                                        <a href="${process.env.FRONTEND_URL}/reagendar-cita/${id_cita}"
                                           style="color: #3B82F6; text-decoration: none; font-weight: 600; margin: 0 15px;">
                                            📅 Reagendar
                                        </a>
                                        <span style="color: #D1D5DB;">|</span>
                                        <a href="${process.env.FRONTEND_URL}/cancelar-cita/${id_cita}"
                                           style="color: #EF4444; text-decoration: none; font-weight: 600; margin: 0 15px;">
                                            ✕ Cancelar
                                        </a>
                                    </p>
                                </td>
                            </tr>

                            <!-- Nota Final -->
                            <tr>
                                <td style="padding-top: 25px; border-top: 2px solid #f0f0f0;">
                                    <p style="margin: 0; font-size: 13px; color: #9CA3AF; text-align: center; line-height: 20px;">
                                        Si no puedes asistir, te agradeceríamos que canceles tu cita<br>
                                        para que podamos ayudar a otros pacientes 🐾
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color: #333333; padding: 25px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="text-align: center;">
                                    <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px;">
                                        ${icono} MollyVet
                                    </p>
                                    <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                                        Sistema de Gestión Veterinaria
                                    </p>
                                    <p style="margin: 10px 0 0; color: #6B7280; font-size: 11px;">
                                        © 2025 MollyVet. Todos los derechos reservados.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

            </table>
        </div>
    </center>
</body>
</html>
    `;

    // Enviar Email
    const info = await transport.sendMail({
        from: '"MollyVet Recordatorios" <recordatorios@mollyvet.com>',
        to: email,
        subject: `⏰ Recordatorio: Cita ${esMañana ? 'Mañana' : 'Próxima'} - ${nombre_mascota}`,
        text: `Hola ${nombre_propietario}, te recordamos que ${nombre_mascota} tiene una cita ${esMañana ? 'mañana' : 'próximamente'} el ${fechaFormateada} a las ${hora.substring(0, 5)}. ¡Te esperamos!`,
        html: htmlContent
    });

    console.log("⏰ Email de recordatorio enviado: %s", info.messageId);
    return info;
};

export default emailRecordatorioCita;
