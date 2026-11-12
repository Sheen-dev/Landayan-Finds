
<?php

header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";

function respond($status, $payload) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function clean_image($path) {
    $path = trim((string) $path);

    if ($path === "") {
        return null;
    }

    if (preg_match('#^https?://[^\s"\'<>]+$#i', $path)) {
        $url = filter_var($path, FILTER_VALIDATE_URL);

        if (!$url) {
            return null;
        }

        $parts = parse_url($url);

        if (
            empty($parts["scheme"]) ||
            empty($parts["host"]) ||
            !in_array(strtolower($parts["scheme"]), ["http", "https"], true)
        ) {
            return null;
        }

        return $path;
    }

    if (strpos($path, "..") !== false) {
        return null;
    }

    return preg_match('#^uploads/[A-Za-z0-9_\-./]+$#', $path) ? $path : null;
}

function clean_photo($path) {
    return clean_image($path);
}

function clean_map($code) {
    $code = trim((string) $code);

    if ($code === "") {
        return null;
    }

    if (preg_match('~src\s*=\s*["\']([^"\']+)["\']~i', $code, $match)) {
        $code = $match[1];
    }

    $code = html_entity_decode($code, ENT_QUOTES);

    return strpos($code, "https://www.google.com/maps") === 0 ? $code : null;
}

function clean_time($time) {
    return $time ? substr($time, 0, 5) : null;
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    respond(405, [
        "success" => false,
        "message" => "Invalid request method."
    ]);
}

try {
    $businessRows = $pdo->query(
        "SELECT business_id, business_name, category, shop_info, address,
                contact_number, contact_email, contact_facebook,
                operating_hours, open_time, close_time, is_24_7,
                profile_image, main_image, sub_image_1, sub_image_2,
                sub_image_3, sub_image_4, map_embed_code
         FROM businesses
         WHERE status = 'approved'
         ORDER BY business_name"
    )->fetchAll();

    $itemRows = $pdo->query(
        "SELECT i.business_id, i.item_name, i.item_type, i.price,
                i.description, i.image_path
         FROM business_items i
         JOIN businesses b ON b.business_id = i.business_id
         WHERE b.status = 'approved'
         ORDER BY i.business_id, i.sort_order, i.item_id"
    )->fetchAll();

    $itemsByBusiness = [];

    foreach ($itemRows as $item) {
        $itemsByBusiness[$item["business_id"]][] = [
            "name" => $item["item_name"],
            "type" => $item["item_type"],
            "price" => $item["price"],
            "description" => $item["description"],
            "image" => clean_image($item["image_path"])
        ];
    }

    $businesses = [];

    foreach ($businessRows as $row) {
        $id = (int) $row["business_id"];

        $photos = array_values(array_filter([
            clean_photo($row["sub_image_1"]),
            clean_photo($row["sub_image_2"]),
            clean_photo($row["sub_image_3"]),
            clean_photo($row["sub_image_4"])
        ]));

        $businesses[] = [
            "id" => $id,
            "name" => $row["business_name"],
            "category" => $row["category"],
            "info" => $row["shop_info"],
            "address" => $row["address"],
            "contact" => $row["contact_number"],
            "email" => $row["contact_email"],
            "facebook" => $row["contact_facebook"],
            "hours" => $row["is_24_7"] ? "Open 24/7" : $row["operating_hours"],
"is247" => (bool) $row["is_24_7"],
            "openTime" => clean_time($row["open_time"]),
            "closeTime" => clean_time($row["close_time"]),
            "profile" => clean_image($row["profile_image"]),
            "cover" => clean_image($row["main_image"]),
            "mapSrc" => clean_map($row["map_embed_code"]),
            "photos" => $photos,
            "products" => $itemsByBusiness[$id] ?? []
        ];
    }

    respond(200, [
        "success" => true,
        "businesses" => $businesses
    ]);

} catch (PDOException $e) {
    error_log($e->getMessage());

    respond(500, [
        "success" => false,
        "message" => "Something went wrong."
    ]);
}
