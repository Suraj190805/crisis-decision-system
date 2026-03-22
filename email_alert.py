import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_alert_email(name: str, condition: str, threshold: float, current_price: float, currency: str) -> None:
    """Send an email notification when a price alert is triggered."""
    sender_email = os.getenv("GMAIL_USER")
    receiver_email = os.getenv("ALERT_EMAIL")
    email_password = os.getenv("GMAIL_PASSWORD")
    smtp_server = "smtp.gmail.com"
    smtp_port = 587

    if not sender_email or not receiver_email or not email_password:
        print(f"[ALERT TRIGGERED] {name} is {condition} {threshold} {currency} (current: {current_price} {currency}) — email not configured")
        return

    subject = f"🚨 Price Alert: {name} {condition} {threshold} {currency}"
    body = f"""
    Price Alert Triggered!

    Asset: {name}
    Condition: Price went {condition} {threshold} {currency}
    Current Price: {current_price} {currency}

    — Crisis Decision System
    """

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = receiver_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, email_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())
        print(f"[EMAIL SENT] Alert for {name}")
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")