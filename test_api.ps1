# Test crear línea con categoría
$token = "YOUR_TOKEN_HERE"
$body = @{
    voucher_id = 44
    line_number = 1
    item_name = "Test Product"
    item_description = "Description"
    quantity = 1
    unit_of_measure = "PZA"
    category = "CONSUMABLE"
} | ConvertTo-Json

curl -X POST "http://127.0.0.1:8001/voucher-details/" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d "$body" `
  -v
