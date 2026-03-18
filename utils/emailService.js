const nodemailer = require('nodemailer');
const { generateInvoicePDF } = require('./invoicePDF');
const fs = require('fs');
const path = require('path');

/**
 * Send a welcome email to a new customer
 * @param {string} customerEmail - Customer's email address
 * @param {string} customerName - Customer's name
 * @param {string} password - Generated password
 * @returns {Promise<boolean>} - Returns true if email sent successfully
 */
const sendWelcomeEmail = async (customerEmail, customerName, password) => {
    try {
        // Create transporter using Gmail or SMTP settings from environment
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Email template
        const htmlContent = `
            <h2>Welcome to CH Automobile!</h2>
            <p>Dear ${customerName},</p>
            <p>Thank you for registering with CH Automobile. We're excited to have you on board!</p>
            <p>Below are your login credentials:</p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
                <p><strong>Email:</strong> ${customerEmail}</p>
                <p><strong>Password:</strong> ${password}</p>
            </div>
            <p>Please keep these credentials safe. You can change your password anytime after your first login.</p>
            <p>If you have any questions or need assistance, feel free to contact us.</p>
            <p>Best regards,<br/>CH Automobile Team</p>
        `;

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: 'Welcome to CH Automobile - Your Account Details',
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${customerEmail}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        return false;
    }
};

// Send a appointment confirmation email to customer
const sendAppointmentConfirmationEmail = async (customerEmail, appointment) => {

    console.log('====================================');
    console.log(customerEmail);
    console.log(appointment);
    console.log('====================================');
    try {
        // Create transporter using Gmail or SMTP settings from environment
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Generate appointment reference ID
        const appointmentRef = appointment?._id || `APT-${Date.now()}`;
        const appointmentDate = new Date(appointment?.appointmentDate);
        const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // Professional industry-level email template
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                    .email-container { max-width: 650px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 30px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                    .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
                    .content { padding: 30px 20px; }
                    .greeting { font-size: 16px; color: #333; margin-bottom: 20px; line-height: 1.6; }
                    .confirmation-box { background-color: #e8f5e9; border-left: 5px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .confirmation-box p { margin: 5px 0; color: #2e7d32; font-weight: 600; }
                    .appointment-details { margin: 25px 0; }
                    .detail-section { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 15px; }
                    .detail-section h3 { margin: 0 0 15px 0; color: #1e3c72; font-size: 16px; border-bottom: 2px solid #2a5298; padding-bottom: 10px; }
                    .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0; }
                    .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
                    .detail-label { font-weight: 600; color: #555; min-width: 150px; }
                    .detail-value { color: #333; text-align: right; flex: 1; }
                    .important { color: #d32f2f; font-weight: 600; }
                    .next-steps { background-color: #fff3cd; border-left: 5px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .next-steps h3 { margin-top: 0; color: #856404; }
                    .next-steps ol { margin: 10px 0; padding-left: 20px; color: #333; }
                    .next-steps li { margin: 8px 0; }
                    .action-button { display: inline-block; background-color: #2a5298; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; margin: 15px 0; }
                    .contact-info { background-color: #ecf0f1; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 14px; }
                    .contact-info p { margin: 8px 0; color: #333; }
                    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
                    .footer p { margin: 5px 0; }
                    .reference-id { background-color: #e3f2fd; padding: 10px; border-radius: 4px; text-align: center; margin: 15px 0; }
                    .reference-id p { margin: 0; font-size: 12px; color: #1565c0; }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <!-- Header -->
                    <div class="header">
                        <h1>✓ Appointment Confirmed</h1>
                        <p>CH Automobile Service</p>
                    </div>

                    <!-- Content -->
                    <div class="content">
                        <div class="greeting">
                            Dear <strong>${appointment.customerName}</strong>,
                        </div>

                        <div class="confirmation-box">
                            <p>✓ Your appointment has been successfully confirmed!</p>
                            <p>We look forward to providing you with excellent service.</p>
                        </div>

                        <!-- Reference ID -->
                        <div class="reference-id">
                            <p><strong>Appointment Reference ID:</strong> ${appointmentRef}</p>
                        </div>

                        <!-- Appointment Details -->
                        <div class="appointment-details">
                            <div class="detail-section">
                                <h3>📅 Service Schedule</h3>
                                <div class="detail-row">
                                    <span class="detail-label">Date:</span>
                                    <span class="detail-value"><strong>${formattedDate}</strong></span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Time:</span>
                                    <span class="detail-value"><strong>${appointment?.appointmentTime}</strong></span>
                                </div>
                            </div>

                            <div class="detail-section">
                                <h3>🚗 Vehicle Information</h3>
                                <div class="detail-row">
                                    <span class="detail-label">Vehicle Number:</span>
                                    <span class="detail-value"><strong>${appointment?.vehicleNumber}</strong></span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Vehicle Model:</span>
                                    <span class="detail-value">${appointment?.vehicleModel}</span>
                                </div>
                            </div>

                            <div class="detail-section">
                                <h3>🔧 Service Details</h3>
                                <div class="detail-row">
                                    <span class="detail-label">Service Type:</span>
                                    <span class="detail-value">${appointment?.serviceType}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Status:</span>
                                    <span class="detail-value"><strong class="important">${appointment?.status}</strong></span>
                                </div>
                                ${appointment?.note ? `<div class="detail-row">
                                    <span class="detail-label">Additional Notes:</span>
                                    <span class="detail-value">${appointment.note}</span>
                                </div>` : ''}
                            </div>
                        </div>

                        <!-- Next Steps -->
                        <div class="next-steps">
                            <h3>📋 What to Do Next</h3>
                            <ol>
                                <li>Arrive <strong>10-15 minutes early</strong> to complete check-in procedures</li>
                                <li>Keep your vehicle keys and documents ready</li>
                                <li>Our service advisors will assess your vehicle and provide an estimate</li>
                                <li>You'll receive updates on service progress via email/SMS</li>
                            </ol>
                        </div>

                        <!-- Contact Information -->
                        <div class="contact-info">
                            <p><strong>📞 Need to Reschedule or Cancel?</strong></p>
                            <p>Contact us at least 24 hours before your appointment for any changes. We're here to help!</p>
                            <p>Email: ${process.env.EMAIL_USER || 'chautomob@gmail.com'}</p>
                            <p>Phone: +94 (71) 427 4163</p>
                        </div>

                        <p style="color: #666; font-size: 14px; line-height: 1.6;">
                            If you have any questions or concerns, please don't hesitate to reach out to our customer service team. We're committed to providing you with the best automotive service experience.
                        </p>
                        <p style="margin-top: 25px; color: #333;">
                            Best regards,<br/>
                            <strong>CH Automobile Service Team</strong><br/>
                            <span style="font-size: 12px; color: #666;">Professional Automotive Service Since [Year]</span>
                        </p>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p><strong>CH Automobile</strong> | Premium Automotive Service Center</p>
                        <p>Address: [Your Service Center Address] | Website: [Your Website]</p>
                        <p>© ${new Date().getFullYear()} CH Automobile. All rights reserved.</p>
                        <p style="margin-top: 10px; font-size: 11px;">This is an automated email. Please do not reply to this email address.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: `Appointment Confirmed - ${formattedDate} at ${appointment?.appointmentTime} | CH Automobile`,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Professional appointment confirmation email sent to ${customerEmail}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending appointment confirmation email:', error);
        return false;
    }
};

/**
 * Send service completion email to customer with invoice details
 * @param {string} customerEmail - Customer's email address
 * @param {string} customerName - Customer's name
 * @param {Object} serviceRecord - Service record with details
 * @returns {Promise<boolean>} - Returns true if email sent successfully
 */
const sendServiceCompletionEmail = async (customerEmail, customerName, serviceRecord) => {

    console.log('====================================');
    console.log(customerEmail);
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Generate reference and format date
        const serviceRef = serviceRecord?._id || `SVC-${Date.now()}`;
        const completionDate = new Date(serviceRecord?.createdAt || new Date());
        const formattedDate = completionDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const formattedTime = completionDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });

        // Calculate parts subtotal
        const partsSubtotal = serviceRecord?.parts?.reduce((sum, part) => {
            return sum + (part.price * part.quantity);
        }, 0) || 0;

        const laborCost = serviceRecord?.laborCost || 0;
        const totalAmount = serviceRecord?.totalAmount || (partsSubtotal + laborCost);

        // Generate parts HTML table
        let partsTableHTML = `
            <tr style="background-color: #f8f9fa; border-bottom: 2px solid #ddd;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #333;">Part Name</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #333;">Qty</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #333;">Unit Price</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #333;">Total</th>
            </tr>
        `;

        if (serviceRecord?.parts && serviceRecord.parts.length > 0) {
            serviceRecord.parts.forEach((part, index) => {
                const partTotal = part.price * part.quantity;
                partsTableHTML += `
                    <tr style="border-bottom: 1px solid #e0e0e0;">
                        <td style="padding: 12px; color: #333;">${part.name}</td>
                        <td style="padding: 12px; text-align: center; color: #555;">${part.quantity}</td>
                        <td style="padding: 12px; text-align: right; color: #555;">Rs. ${part.price.toFixed(2)}</td>
                        <td style="padding: 12px; text-align: right; color: #333; font-weight: 600;">Rs. ${partTotal.toFixed(2)}</td>
                    </tr>
                `;
            });
        } else {
            partsTableHTML += `
                <tr style="border-bottom: 1px solid #e0e0e0;">
                    <td colspan="4" style="padding: 12px; text-align: center; color: #999;">No parts used</td>
                </tr>
            `;
        }

        // Professional email template
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                    .email-container { max-width: 700px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #27ae60 0%, #229954 100%); color: white; padding: 30px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                    .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
                    .content { padding: 30px 20px; }
                    .greeting { font-size: 16px; color: #333; margin-bottom: 20px; line-height: 1.6; }
                    .success-box { background-color: #d4edda; border-left: 5px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .success-box p { margin: 5px 0; color: #155724; font-weight: 600; }
                    .reference-id { background-color: #e3f2fd; padding: 12px 15px; border-radius: 4px; text-align: center; margin: 15px 0; border: 1px solid #90caf9; }
                    .reference-id p { margin: 0; font-size: 13px; color: #1565c0; }
                    .reference-id strong { font-size: 14px; }
                    .detail-section { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 15px; }
                    .detail-section h3 { margin: 0 0 15px 0; color: #229954; font-size: 16px; border-bottom: 2px solid #27ae60; padding-bottom: 10px; }
                    .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0; }
                    .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
                    .detail-label { font-weight: 600; color: #555; min-width: 150px; }
                    .detail-value { color: #333; text-align: right; flex: 1; }
                    .invoice-section { margin: 25px 0; }
                    .invoice-table { width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
                    .summary-box { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
                    .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; }
                    .summary-row:last-child { margin-bottom: 0; }
                    .summary-row:last-child .label { font-weight: 700; color: #27ae60; }
                    .summary-row:last-child .amount { font-weight: 700; color: #27ae60; font-size: 18px; }
                    .summary-row .label { color: #555; }
                    .summary-row .amount { color: #333; text-align: right; flex: 1; }
                    .next-steps { background-color: #e8f4f8; border-left: 5px solid #3498db; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .next-steps h3 { margin-top: 0; color: #2c3e50; font-size: 15px; }
                    .next-steps ul { margin: 10px 0; padding-left: 20px; color: #333; }
                    .next-steps li { margin: 6px 0; font-size: 14px; }
                    .contact-info { background-color: #ecf0f1; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 14px; }
                    .contact-info p { margin: 8px 0; color: #333; }
                    .footer { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; }
                    .footer p { margin: 5px 0; }
                    .highlight { color: #27ae60; font-weight: 600; }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <!-- Header -->
                    <div class="header">
                        <h1>✓ Service Completed</h1>
                        <p>CH Automobile Service - Invoice & Completion Notice</p>
                    </div>

                    <!-- Content -->
                    <div class="content">
                        <div class="greeting">
                            Dear <strong>${customerName}</strong>,
                        </div>

                        <div class="success-box">
                            <p>✓ Your vehicle service has been successfully completed and is ready for pickup!</p>
                            <p>We appreciate your business and trust in CH Automobile.</p>
                        </div>

                        <!-- Reference ID -->
                        <div class="reference-id">
                            <p><strong>Service Record Reference:</strong> ${serviceRef}</p>
                        </div>

                        <!-- Service Details -->
                        <div class="detail-section">
                            <h3>📋 Service Completion Details</h3>
                            <div class="detail-row">
                                <span class="detail-label">Completion Date:</span>
                                <span class="detail-value"><strong>${formattedDate}</strong></span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Completion Time:</span>
                                <span class="detail-value"><strong>${formattedTime}</strong></span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Vehicle Number:</span>
                                <span class="detail-value"><strong>${serviceRecord?.vehicleNumber || 'N/A'}</strong></span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Service Status:</span>
                                <span class="detail-value"><strong class="highlight">${serviceRecord?.status?.toUpperCase() || 'COMPLETED'}</strong></span>
                            </div>
                            ${serviceRecord?.serviceDescription ? `
                            <div class="detail-row">
                                <span class="detail-label">Service Description:</span>
                                <span class="detail-value">${serviceRecord.serviceDescription}</span>
                            </div>
                            ` : ''}
                        </div>

                        <!-- Invoice Section -->
                        <div class="invoice-section">
                            <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 16px;">🧾 Service Invoice</h3>
                            <table class="invoice-table">
                                ${partsTableHTML}
                            </table>
                        </div>

                        <!-- Cost Summary -->
                        <div class="summary-box">
                            <div class="summary-row">
                                <span class="label">Parts Subtotal:</span>
                                <span class="amount">Rs.${partsSubtotal.toFixed(2)}</span>
                            </div>
                            <div class="summary-row">
                                <span class="label">Labor Cost:</span>
                                <span class="amount">Rs.${laborCost.toFixed(2)}</span>
                            </div>
                            <div style="border-top: 2px solid #bbb; margin-top: 12px; padding-top: 12px;"></div>
                            <div class="summary-row">
                                <span class="label">Total Amount Due:</span>
                                <span class="amount">Rs.${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <!-- Next Steps -->
                        <div class="next-steps">
                            <h3>📌 Next Steps</h3>
                            <ul>
                                <li><strong>Pickup Timing:</strong> Your vehicle is ready for pickup. Please arrange pickup at your earliest convenience during business hours.</li>
                                <li><strong>Payment:</strong> Please settle the invoice amount of <strong class="highlight">$${totalAmount.toFixed(2)}</strong> at the time of pickup.</li>
                                <li><strong>Warranty:</strong> All service work is covered by our 30-day guarantee. Contact us if you experience any issues.</li>
                                <li><strong>Next Service:</strong> We recommend scheduling your next maintenance within 3-6 months.</li>
                            </ul>
                        </div>

                        <!-- Contact Information -->
                        <div class="contact-info">
                            <p><strong>📞 Need Assistance?</strong></p>
                            <p>Our customer service team is ready to help!</p>
                            <p>Email: ${process.env.EMAIL_USER || 'chautomob@gmail.com'}</p>
                            <p>Phone: +94 (71) 427 4163</p>
                            <p>Address: 304 A Abaya Street, Kalutara, Sri Lanka</p>
                        </div>

                        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
                            Thank you for choosing CH Automobile for your vehicle maintenance and repair needs. We're committed to providing you with the highest quality service and ensuring your complete satisfaction.
                        </p>

                        <p style="margin-top: 25px; color: #333;">
                            Best regards,<br/>
                            <strong>CH Automobile Service Team</strong><br/>
                            <span style="font-size: 12px; color: #666;">Professional Automotive Service Since [Year]</span>
                        </p>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p><strong>CH Automobile</strong> | Premium Automotive Service Center</p>
                        <p>Address: [Your Service Center Address] | Website: [Your Website]</p>
                        <p>© ${new Date().getFullYear()} CH Automobile. All rights reserved.</p>
                        <p style="margin-top: 10px; font-size: 11px;">This is an automated email. Please do not reply to this email address.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: `Service Completed - Invoice Ready | CH Automobile (Ref: ${serviceRef})`,
            html: htmlContent,
        };

        // Generate and attach invoice PDF
        const invoicesDir = path.join(__dirname, '../invoices');
        const pdfFileName = `invoice_${serviceRef}_${Date.now()}.pdf`;
        const pdfFilePath = path.join(invoicesDir, pdfFileName);

        try {
            await generateInvoicePDF(serviceRecord, { name: customerName, email: customerEmail }, pdfFilePath);
            
            // Attach PDF to email
            mailOptions.attachments = [
                {
                    filename: `CH_Automobile_Invoice_${serviceRef}.pdf`,
                    path: pdfFilePath,
                }
            ];

            await transporter.sendMail(mailOptions);
            console.log(`✅ Service completion email with PDF invoice sent to ${customerEmail}`);

            // Clean up PDF after sending (optional - remove if you want to keep invoices)
            // setTimeout(() => {
            //     if (fs.existsSync(pdfFilePath)) {
            //         fs.unlink(pdfFilePath, (err) => {
            //             if (err) console.error('Error deleting PDF:', err);
            //         });
            //     }
            // }, 5000);

            return true;
        } catch (pdfError) {
            console.error('⚠️ PDF generation failed, sending email without attachment:', pdfError);
            // Send email without PDF if PDF generation fails
            await transporter.sendMail(mailOptions);
            console.log(`✅ Service completion email sent to ${customerEmail} (without PDF)`);
            return true;
        }
    } catch (error) {
        console.error('❌ Error sending service completion email:', error);
        return false;
    }
};

module.exports = { sendWelcomeEmail, sendAppointmentConfirmationEmail, sendServiceCompletionEmail };
