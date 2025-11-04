import nodemailer from 'nodemailer';

/**
 * Helper para enviar email de confirmación de cita médica o estética
 * @param {Object} datos - Datos de la cita y paciente
 */
const emailConfirmacionCita = async (datos) => {
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
        nombre_doctor,
        notas,
        id_cita,
        duracion_estimada
    } = datos;

    // Formatear fecha
    const fechaObj = new Date(fecha);
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = fechaObj.toLocaleDateString('es-MX', opciones);

    // Determinar el icono y color según tipo
    const esCitaMedica = tipo === 'medica';
    const icono = esCitaMedica ? '🏥' : '✨';
    const colorPrincipal = esCitaMedica ? '#FF7600' : '#9333EA';
    const colorSecundario = esCitaMedica ? '#e60d0d' : '#7C3AED';
    const tipoTexto = esCitaMedica ? 'Consulta Médica' : 'Servicio de Estética';

    // Mapear tipos de consulta
    const tiposConsulta = {
        'primera_vez': 'Primera Vez',
        'seguimiento': 'Seguimiento',
        'urgencia': 'Urgencia',
        'vacunacion': 'Vacunación'
    };

    const tiposEstetica = {
        'baño': 'Baño',
        'corte': 'Corte',
        'baño_corte': 'Baño y Corte',
        'uñas': 'Corte de Uñas',
        'limpieza_dental': 'Limpieza Dental',
        'spa_premium': 'Spa Premium',
        'deslanado': 'Deslanado',
        'tratamiento_pulgas': 'Tratamiento Anti-pulgas',
        'otro': 'Otro'
    };

    const servicioDescripcion = esCitaMedica
        ? tiposConsulta[tipo_servicio] || 'Consulta'
        : tiposEstetica[tipo_servicio] || 'Servicio';

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Cita - MollyVet</title>
    <style>
        @media screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                margin: auto !important;
            }
            .mobile-padding {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }
            .stack-column {
                display: block !important;
                width: 100% !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
    <center style="width: 100%; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto;" class="email-container">
            <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">

                <!-- Header -->
                <tr>
                    <td style="background: linear-gradient(-45deg, ${colorPrincipal} 0%, ${colorSecundario} 100%); text-align: center; padding: 40px 20px;">
                        <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff;">
                            ${icono} MollyVet
                        </h1>
                        <p style="margin: 10px 0 0; font-size: 14px; color: #ffffff; opacity: 0.9;">
                            ${tipoTexto}
                        </p>
                    </td>
                </tr>

                <!-- Main Content -->
                <tr>
                    <td style="background-color: #ffffff; padding: 40px 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

                            <!-- Confirmación -->
                            <tr>
                                <td style="text-align: center; padding-bottom: 30px;">
                                    <div style="background-color: #10B981; border-radius: 50%; width: 60px; height: 60px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                                        <span style="font-size: 30px; color: white; line-height: 60px;">✓</span>
                                    </div>
                                    <h2 style="margin: 0; font-size: 24px; color: #333333;">
                                        ¡Cita Confirmada!
                                    </h2>
                                    <p style="margin: 10px 0 0; color: #666666; font-size: 16px;">
                                        Hola ${nombre_propietario}
                                    </p>
                                </td>
                            </tr>

                            <!-- Detalles de la Cita -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; margin-bottom: 20px;">
                                    <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #ffffff; text-align: center;">
                                        📋 Detalles de tu Cita
                                    </h3>

                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                                                <table width="100%">
                                                    <tr>
                                                        <td style="color: rgba(255,255,255,0.8); font-size: 14px; width: 40%;">Paciente:</td>
                                                        <td style="color: #ffffff; font-size: 16px; font-weight: bold; text-align: right;">
                                                            🐾 ${nombre_mascota}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                                                <table width="100%">
                                                    <tr>
                                                        <td style="color: rgba(255,255,255,0.8); font-size: 14px; width: 40%;">Fecha:</td>
                                                        <td style="color: #ffffff; font-size: 16px; font-weight: bold; text-align: right;">
                                                            📅 ${fechaFormateada}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                                                <table width="100%">
                                                    <tr>
                                                        <td style="color: rgba(255,255,255,0.8); font-size: 14px; width: 40%;">Hora:</td>
                                                        <td style="color: #ffffff; font-size: 16px; font-weight: bold; text-align: right;">
                                                            ⏰ ${hora.substring(0, 5)}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                                                <table width="100%">
                                                    <tr>
                                                        <td style="color: rgba(255,255,255,0.8); font-size: 14px; width: 40%;">Servicio:</td>
                                                        <td style="color: #ffffff; font-size: 16px; font-weight: bold; text-align: right;">
                                                            ${servicioDescripcion}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        ${duracion_estimada ? `
                                        <tr>
                                            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                                                <table width="100%">
                                                    <tr>
                                                        <td style="color: rgba(255,255,255,0.8); font-size: 14px; width: 40%;">Duración:</td>
                                                        <td style="color: #ffffff; font-size: 16px; font-weight: bold; text-align: right;">
                                                            ⌛ ${duracion_estimada} min
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        ` : ''}
                                        ${nombre_doctor ? `
                                        <tr>
                                            <td style="padding: 10px 0;">
                                                <table width="100%">
                                                    <tr>
                                                        <td style="color: rgba(255,255,255,0.8); font-size: 14px; width: 40%;">Doctor:</td>
                                                        <td style="color: #ffffff; font-size: 16px; font-weight: bold; text-align: right;">
                                                            👨‍⚕️ ${nombre_doctor}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        ` : ''}
                                    </table>
                                </td>
                            </tr>

                            ${notas ? `
                            <!-- Notas Especiales -->
                            <tr>
                                <td style="padding: 20px 0;">
                                    <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 4px;">
                                        <p style="margin: 0; color: #92400E; font-size: 14px;">
                                            <strong>📌 Notas importantes:</strong><br>
                                            ${notas}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                            ` : ''}

                            ${esCitaMedica && tipo_servicio === 'vacunacion' ? `
                            <!-- Preparación para Vacunación -->
                            <tr>
                                <td style="padding: 20px 0;">
                                    <div style="background-color: #DBEAFE; border-left: 4px solid #3B82F6; padding: 15px; border-radius: 4px;">
                                        <p style="margin: 0 0 10px 0; color: #1E3A8A; font-size: 14px; font-weight: bold;">
                                            💉 Preparación para la vacunación:
                                        </p>
                                        <ul style="margin: 0; padding-left: 20px; color: #1E40AF; font-size: 14px;">
                                            <li>Traer cartilla de vacunación</li>
                                            <li>Mascota en ayuno de 4 horas (solo agua)</li>
                                            <li>Evitar ejercicio intenso antes de la cita</li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            ` : ''}

                            ${!esCitaMedica && (tipo_servicio === 'baño' || tipo_servicio === 'baño_corte') ? `
                            <!-- Preparación para Estética -->
                            <tr>
                                <td style="padding: 20px 0;">
                                    <div style="background-color: #F3E8FF; border-left: 4px solid #9333EA; padding: 15px; border-radius: 4px;">
                                        <p style="margin: 0 0 10px 0; color: #581C87; font-size: 14px; font-weight: bold;">
                                            ✨ Recomendaciones:
                                        </p>
                                        <ul style="margin: 0; padding-left: 20px; color: #6B21A8; font-size: 14px;">
                                            <li>Evitar dar de comer 2 horas antes del servicio</li>
                                            <li>Traer collar o arnés de repuesto</li>
                                            <li>Avisar sobre cualquier sensibilidad en la piel</li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            ` : ''}

                            <!-- Botones de Acción -->
                            <tr>
                                <td style="padding: 30px 0 20px;">
                                    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: auto; width: 100%;">
                                        <tr>
                                            <td style="padding: 5px 0;">
                                                <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: auto;">
                                                    <tr>
                                                        <td style="border-radius: 50px; background: linear-gradient(-45deg, #10B981 0%, #059669 100%);">
                                                            <a href="${process.env.FRONTEND_URL}/confirmar-cita/${id_cita}"
                                                               style="background: transparent; border-radius: 50px; color: #ffffff; display: inline-block; font-size: 14px; font-weight: bold; line-height: 45px; text-align: center; text-decoration: none; width: 240px;">
                                                                ✓ Confirmar Asistencia
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 5px 0;">
                                                <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: auto;">
                                                    <tr>
                                                        <td style="border-radius: 50px; background-color: #F59E0B;">
                                                            <a href="${process.env.FRONTEND_URL}/reagendar-cita/${id_cita}"
                                                               style="background: transparent; border-radius: 50px; color: #ffffff; display: inline-block; font-size: 14px; font-weight: bold; line-height: 45px; text-align: center; text-decoration: none; width: 240px;">
                                                                📅 Reagendar Cita
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 5px 0;">
                                                <p style="text-align: center; margin: 10px 0 0; font-size: 13px;">
                                                    <a href="${process.env.FRONTEND_URL}/cancelar-cita/${id_cita}" style="color: #EF4444; text-decoration: none;">
                                                        Cancelar cita
                                                    </a>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Recordatorio -->
                            <tr>
                                <td style="padding-top: 20px; border-top: 2px solid #f0f0f0;">
                                    <p style="margin: 0; font-size: 13px; color: #999999; text-align: center; line-height: 20px;">
                                        📧 Recibirás un recordatorio 24 horas antes de tu cita<br>
                                        📱 Si tienes alguna duda, contáctanos
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color: #333333; padding: 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="color: #ffffff; font-size: 14px; text-align: center;">
                                    <p style="margin: 0 0 10px 0;">MollyVet - Sistema de Gestión Veterinaria</p>
                                    <p style="margin: 0; color: #999999; font-size: 12px;">
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
        from: '"MollyVet" <citas@mollyvet.com>',
        to: email,
        subject: `${icono} Confirmación de ${tipoTexto} - ${nombre_mascota}`,
        text: `Hola ${nombre_propietario}, tu cita para ${nombre_mascota} ha sido confirmada. Fecha: ${fechaFormateada} a las ${hora.substring(0, 5)}. Servicio: ${servicioDescripcion}.`,
        html: htmlContent
    });

    console.log("📧 Email de confirmación enviado: %s", info.messageId);
    return info;
};

export default emailConfirmacionCita;
