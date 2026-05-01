import smtplib

sender_email = "manoharchirukuri09@gmail.com"
password = "uxxcvrlmvcslmgoa"

print("Attempting to connect to smtp.gmail.com:587...")
try:
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.set_debuglevel(1)
    server.starttls()
    print("Attempting to login...")
    server.login(sender_email, password)
    print("Login successful! The SMTP credentials are valid and working.")
    server.quit()
except Exception as e:
    print(f"Failed to connect or login. Error: {e}")
