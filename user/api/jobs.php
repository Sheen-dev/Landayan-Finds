<?php

header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";

function respond($status, $payload) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function to_lines($text) {
    $lines = preg_split('/\r\n|\r|\n/', trim((string) $text));
    $clean = [];

    foreach ($lines as $line) {
        $line = trim(preg_replace('/^\s*[-*•]\s*/u', '', $line));

        if ($line !== "") {
            $clean[] = $line;
        }
    }

    return $clean;
}

function clean_map($code) {
    $code = trim((string) $code);

    if ($code === "") {
        return null;
    }

    if (preg_match('/src\s*=\s*["\']([^"\']+)["\']/i', $code, $match)) {
        $code = $match[1];
    }

    $code = html_entity_decode($code, ENT_QUOTES);

    return strpos($code, "https://www.google.com/maps") === 0 ? $code : null;
}

function clean_image($path) {
    $path = trim((string) $path);

    if ($path === "" || strpos($path, "..") !== false) {
        return null;
    }

    return preg_match('#^uploads/[A-Za-z0-9_\-./]+$#', $path) ? $path : null;
}

function get_profile_image($profileImage) {
    return clean_image($profileImage);
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    respond(405, [
        "success" => false,
        "message" => "Invalid request method."
    ]);
}

try {

    $rows = $pdo->query(
        "SELECT j.job_id, j.job_title, j.job_description, j.requirements,
                j.responsibilities, j.qualifications, j.employment_type,
                j.salary, j.schedule, j.how_to_apply, j.location,
                j.application_deadline, j.created_at,
                b.business_name, b.category, b.contact_number,
                b.map_embed_code, b.profile_image
         FROM jobs j
         JOIN businesses b ON b.business_id = j.business_id
         WHERE j.status = 'approved'
           AND b.status = 'approved'
           AND (j.application_deadline IS NULL
                OR j.application_deadline >= CURDATE())
         ORDER BY j.created_at DESC"
    )->fetchAll();

    $jobs = [];

    foreach ($rows as $row) {

        $types = array_values(array_filter(array_map(
            "trim",
            explode("/", (string) $row["employment_type"])
        )));

        $jobs[] = [
            "id"               => (int) $row["job_id"],
            "title"            => $row["job_title"],
            "business"         => $row["business_name"],
            "category"         => $row["category"],
            "profile"          => get_profile_image($row["profile_image"]),
            "type"             => implode(" / ", $types),
            "types"            => $types,
            "salary"           => $row["salary"],
            "schedule"         => $row["schedule"],
            "location"         => $row["location"],
            "posted"           => substr($row["created_at"], 0, 10),
            "deadline"         => $row["application_deadline"],
            "status"           => "Hiring",
            "description"      => $row["job_description"],
            "requirements"     => to_lines($row["requirements"]),
            "responsibilities" => to_lines($row["responsibilities"]),
            "qualifications"   => to_lines($row["qualifications"]),
            "application"      => to_lines($row["how_to_apply"]),
            "mapSrc"           => clean_map($row["map_embed_code"])
        ];
    }

    respond(200, [
        "success" => true,
        "jobs" => $jobs
    ]);

} catch (PDOException $e) {

    error_log($e->getMessage());

    respond(500, [
        "success" => false,
        "message" => "Something went wrong."
    ]);
}