$client_id = "178c6fc778ccc68e1d6a"
$device_code = "1b1cadb8a836bccb3c262011033e14752cd8f0d6"
$log_file = "C:\Root_entity\github_push_status.log"

Write-Output "Waiting for user to authorize GitHub..." | Out-File $log_file

$token = $null
while ($null -eq $token) {
    Start-Sleep -Seconds 5
    $json = curl.exe -s -H "Accept: application/json" -d "client_id=$client_id&device_code=$device_code&grant_type=urn:ietf:params:oauth:grant-type:device_code" "https://github.com/login/oauth/access_token"
    
    if ($json -match '"access_token":"([^"]+)"') {
        $token = $matches[1]
    } elseif ($json -match '"error":"authorization_pending"') {
        # continue waiting
    } else {
        Write-Output "Error: $json" | Out-File $log_file -Append
        exit 1
    }
}

Write-Output "Token acquired. Configuring Git and pushing..." | Out-File $log_file -Append

cd C:\Root_entity
# Set credential securely
git config --local user.email "sales@resolutionassurance.com.au"
git config --local user.name "RA Sovereign Node"
git remote set-url origin "https://$token@github.com/chippy8444/Resolution-assurance-protocol.git"

git push -u origin main 2>&1 | Out-File $log_file -Append
if ($LASTEXITCODE -eq 0) {
    Write-Output "SUCCESS: Graph synced to GitHub." | Out-File $log_file -Append
} else {
    Write-Output "FAILED: Git push failed." | Out-File $log_file -Append
}
