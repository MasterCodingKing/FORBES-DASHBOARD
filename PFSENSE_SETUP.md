# pfSense Port Forwarding Quick Reference

## Required Port Forwarding Rules

Configure these rules in pfSense: **Firewall > NAT > Port Forward**

### Rule 1: Frontend Access

```
Interface:              WAN
Protocol:               TCP
Source:                 Any
Destination:            WAN address
Destination Port:       8443
Redirect Target IP:     [Your Laragon Server IP]
Redirect Target Port:   3000
Description:            Forbes Dashboard - Frontend
```

### Rule 2: API Access

```
Interface:              WAN
Protocol:               TCP
Source:                 Any
Destination:            WAN address
Destination Port:       5000
Redirect Target IP:     [Your Laragon Server IP]
Redirect Target Port:   5000
Description:            Forbes Dashboard - API
```

## How to Find Your Laragon Server IP

### Method 1: PowerShell

```powershell
ipconfig
```

Look for "IPv4 Address" under your active network adapter (usually Ethernet or Wi-Fi).

### Method 2: Windows Settings

1. Open Settings > Network & Internet
2. Click on your active connection
3. Look for IPv4 address

**Example IPs to look for:**

- 192.168.1.x
- 192.168.0.x
- 10.0.0.x
- 172.16.x.x

## Testing Port Forwarding

### From External Network (use mobile data or ask friend):

```bash
# Test frontend
curl -I https://115.42.122.19:8443

# Test API
curl https://115.42.122.19:5000/api/health
```

### From Internal Network:

```powershell
# Test that services are listening locally
netstat -an | findstr ":3000"
netstat -an | findstr ":5000"
```

## Troubleshooting

### Issue: Can't access from external network

1. Verify pfSense rules are enabled (green checkmark)
2. Check Windows Firewall allows ports 3000 and 5000
3. Verify Docker containers are running: `docker-compose ps`
4. Test local access first before testing public access
5. Check pfSense logs: Status > System Logs > Firewall

### Issue: "Connection refused"

- Services are not running
- Run: `docker-compose up -d`

### Issue: "Connection timeout"

- pfSense rules not configured correctly
- Windows Firewall blocking connection
- ISP blocking ports (some ISPs block certain ports)

### Issue: Works locally but not externally

- Port forwarding not configured in pfSense
- Public IP is incorrect (verify with: `curl ifconfig.me`)
- Router upstream from pfSense may need configuration

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change All Default Passwords**

   - Update JWT_SECRET in server/.env
   - Change MySQL passwords
   - Use strong admin passwords

2. **Monitor Access Logs**

   - Check pfSense firewall logs regularly
   - Review application audit logs

3. **Keep Updated**

   - Update dependencies regularly
   - Apply security patches promptly

4. **Backup Regularly**

   - Database backups
   - Configuration file backups

5. **Consider Using a Domain with SSL**
   - Use Cloudflare for free SSL
   - Or use Let's Encrypt certificates
   - HTTPS is more secure than HTTP

## Next Steps

After setting up port forwarding:

1. ✅ Configure pfSense rules (see above)
2. ✅ Deploy application: Run `deploy-public.bat`
3. ✅ Test local access: http://localhost:3000
4. ✅ Test public access: https://115.42.122.19:8443
5. ✅ Change default passwords
6. ✅ Set up SSL (optional but recommended)

## Support

For detailed instructions, see: **PUBLIC_IP_SETUP_GUIDE.md**
