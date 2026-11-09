
<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../api/db.php";

const OWNER_USER_ID = 1;

function respond($success, $message = "", $data = null, $status = 200) {
    http_response_code($status);

    echo json_encode([
        "success" => $success,
        "message" => $message,
        "data" => $data
    ]);

    exit;
}

function read_input() {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    return is_array($data) ? $data : [];
}

function value($data, $key, $default = "") {
    return isset($data[$key]) ? trim((string) $data[$key]) : $default;
}

function get_business($pdo, $businessId) {
    $businessQuery = $pdo->prepare("
        SELECT *
        FROM businesses
        WHERE business_id = ?
        LIMIT 1
    ");

    $businessQuery->execute([$businessId]);
    $business = $businessQuery->fetch();

    if (!$business) {
        return null;
    }

    $itemsQuery = $pdo->prepare("
        SELECT *
        FROM business_items
        WHERE business_id = ?
        ORDER BY sort_order ASC, item_id ASC
    ");

    $itemsQuery->execute([$businessId]);
    $business["items"] = $itemsQuery->fetchAll();

    $jobQuery = $pdo->prepare("
        SELECT *
        FROM jobs
        WHERE business_id = ?
        ORDER BY job_id DESC
        LIMIT 1
    ");

    $jobQuery->execute([$businessId]);
    $business["job"] = $jobQuery->fetch() ?: null;

    return $business;
}

try {
    $method = $_SERVER["REQUEST_METHOD"];

    if ($method === "GET") {
        $action = $_GET["action"] ?? "list";

        if ($action === "list") {
            $query = $pdo->prepare("
                SELECT
                    business_id,
                    business_name,
                    category,
                    address,
                    profile_image,
                    main_image,
                    status
                FROM businesses
                ORDER BY business_name ASC
            ");

            $query->execute();

            respond(true, "Businesses loaded.", $query->fetchAll());
        }

        if ($action === "get") {
            $businessId = (int) ($_GET["id"] ?? 0);

            if ($businessId <= 0) {
                respond(false, "Invalid business ID.", null, 400);
            }

            $business = get_business($pdo, $businessId);

            if (!$business) {
                respond(false, "Business not found.", null, 404);
            }

            respond(true, "Business loaded.", $business);
        }

        respond(false, "Invalid action.", null, 400);
    }

    if ($method === "POST") {
        $input = read_input();
        $action = $input["action"] ?? "";

        if ($action === "delete") {
            $businessId = (int) ($input["business_id"] ?? 0);

            if ($businessId <= 0) {
                respond(false, "Invalid business ID.", null, 400);
            }

            $query = $pdo->prepare("
                DELETE FROM businesses
                WHERE business_id = ?
            ");

            $query->execute([$businessId]);

            if ($query->rowCount() === 0) {
                respond(false, "Business not found.", null, 404);
            }

            respond(true, "Business deleted successfully.");
        }

        if ($action !== "save") {
            respond(false, "Invalid action.", null, 400);
        }

        $business = $input["business"] ?? $input;
        $items = $input["items"] ?? [];
        $job = $input["job"] ?? null;

        if (!is_array($business)) {
            respond(false, "Invalid business information.", null, 400);
        }

        if (!is_array($items)) {
            respond(false, "Invalid items information.", null, 400);
        }

        $businessId = (int) ($input["business_id"] ?? $business["business_id"] ?? 0);

        $businessName = value($business, "business_name", value($business, "shop_name"));
        $category = value($business, "category");
        $shopInfo = value($business, "shop_info", value($business, "about"));
        $address = value($business, "address");
        $contactNumber = value($business, "contact_number");
        $contactEmail = value($business, "contact_email");
        $contactFacebook = value($business, "contact_facebook");
        $website = value($business, "website");
        $operatingHours = value($business, "operating_hours");
        $openTime = value($business, "open_time");
        $closeTime = value($business, "close_time");
        $mapEmbed = value($business, "map_embed_code", value($business, "map_embed"));

        $profileImage = value($business, "profile_image", value($business, "profile_photo"));
        $coverImage = value($business, "main_image", value($business, "cover_photo"));

        $photo2 = value($business, "sub_image_1", value($business, "photo_2"));
        $photo3 = value($business, "sub_image_2", value($business, "photo_3"));
        $photo4 = value($business, "sub_image_3", value($business, "photo_4"));
        $photo5 = value($business, "sub_image_4", value($business, "photo_5"));

        if ($businessName === "" || $category === "" || $shopInfo === "" || $address === "") {
            respond(false, "Please complete the business name, category, about, and address.", null, 400);
        }

        $allowedCategories = [
            "Food and Beverages",
            "Services",
            "Stores",
            "Health and Care",
            "Others"
        ];

        if (!in_array($category, $allowedCategories, true)) {
            respond(false, "Invalid business category. Please choose one of the five available categories.", null, 400);
        }

        $cleanItems = [];

        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }

            $itemName = value($item, "item_name", value($item, "name"));
            $itemType = strtolower(value($item, "item_type", value($item, "type")));
            $price = value($item, "price");
            $description = value($item, "description");
            $imagePath = value($item, "image_path", value($item, "photo"));

            if ($itemName === "") {
                continue;
            }

            if (!in_array($itemType, ["product", "service"], true)) {
                respond(false, "Each item must have a valid product or service type.", null, 400);
            }

            $cleanItems[] = [
                "name" => $itemName,
                "type" => $itemType,
                "price" => $price,
                "description" => $description,
                "image" => $imagePath
            ];
        }

        $hasHiring = !empty($input["hiring"]) || !empty($business["hiring"]);

        if ($job === null && isset($input["job"]) && is_array($input["job"])) {
            $job = $input["job"];
        }

        if ($hasHiring && !is_array($job)) {
            respond(false, "Please provide the job information.", null, 400);
        }

        $cleanJob = null;

        if ($hasHiring) {
            $jobTitle = value($job, "job_title", value($job, "position"));
            $jobDescription = value($job, "job_description", value($job, "description"));
            $requirements = value($job, "requirements");
            $responsibilities = value($job, "responsibilities");
            $qualifications = value($job, "qualifications");
            $employmentType = value($job, "employment_type", value($job, "job_time"));
            $salary = value($job, "salary");
            $schedule = value($job, "schedule");
            $howToApply = value($job, "how_to_apply");
            $jobLocation = value($job, "location", $address);

            if ($jobTitle === "" || $jobDescription === "") {
                respond(false, "Please enter the job position and job description.", null, 400);
            }

            $cleanJob = [
                "title" => $jobTitle,
                "description" => $jobDescription,
                "requirements" => $requirements,
                "responsibilities" => $responsibilities,
                "qualifications" => $qualifications,
                "employment_type" => $employmentType !== "" ? $employmentType : "Not specified",
                "salary" => $salary,
                "schedule" => $schedule,
                "how_to_apply" => $howToApply,
                "location" => $jobLocation !== "" ? $jobLocation : $address
            ];
        }

        $productsServices = implode(", ", array_column($cleanItems, "name"));

        $pdo->beginTransaction();

        if ($businessId > 0) {
            $check = $pdo->prepare("
                SELECT business_id
                FROM businesses
                WHERE business_id = ?
            ");

            $check->execute([$businessId]);

            if (!$check->fetch()) {
                $pdo->rollBack();
                respond(false, "Business not found.", null, 404);
            }

            $query = $pdo->prepare("
                UPDATE businesses SET
                    business_name = ?,
                    category = ?,
                    shop_info = ?,
                    address = ?,
                    contact_number = ?,
                    contact_email = ?,
                    contact_facebook = ?,
                    website = ?,
                    operating_hours = ?,
                    open_time = ?,
                    close_time = ?,
                    products_services = ?,
                    profile_image = ?,
                    main_image = ?,
                    sub_image_1 = ?,
                    sub_image_2 = ?,
                    sub_image_3 = ?,
                    sub_image_4 = ?,
                    map_embed_code = ?,
                    status = 'approved'
                WHERE business_id = ?
            ");

            $query->execute([
                $businessName,
                $category,
                $shopInfo,
                $address,
                $contactNumber,
                $contactEmail,
                $contactFacebook,
                $website,
                $operatingHours,
                $openTime !== "" ? $openTime : null,
                $closeTime !== "" ? $closeTime : null,
                $productsServices,
                $profileImage,
                $coverImage,
                $photo2,
                $photo3,
                $photo4,
                $photo5,
                $mapEmbed,
                $businessId
            ]);

            $deleteItems = $pdo->prepare("
                DELETE FROM business_items
                WHERE business_id = ?
            ");

            $deleteItems->execute([$businessId]);

        } else {
            $query = $pdo->prepare("
                INSERT INTO businesses (
                    owner_user_id,
                    business_name,
                    category,
                    shop_info,
                    address,
                    contact_number,
                    contact_email,
                    contact_facebook,
                    website,
                    operating_hours,
                    open_time,
                    close_time,
                    products_services,
                    profile_image,
                    main_image,
                    sub_image_1,
                    sub_image_2,
                    sub_image_3,
                    sub_image_4,
                    map_embed_code,
                    status
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved'
                )
            ");

            $query->execute([
                OWNER_USER_ID,
                $businessName,
                $category,
                $shopInfo,
                $address,
                $contactNumber,
                $contactEmail,
                $contactFacebook,
                $website,
                $operatingHours,
                $openTime !== "" ? $openTime : null,
                $closeTime !== "" ? $closeTime : null,
                $productsServices,
                $profileImage,
                $coverImage,
                $photo2,
                $photo3,
                $photo4,
                $photo5,
                $mapEmbed
            ]);

            $businessId = (int) $pdo->lastInsertId();
        }

        $insertItem = $pdo->prepare("
            INSERT INTO business_items (
                business_id,
                item_name,
                item_type,
                price,
                description,
                image_path,
                sort_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        foreach ($cleanItems as $index => $item) {
            $insertItem->execute([
                $businessId,
                $item["name"],
                $item["type"],
                $item["price"],
                $item["description"],
                $item["image"],
                $index + 1
            ]);
        }

        $existingJobQuery = $pdo->prepare("
            SELECT job_id
            FROM jobs
            WHERE business_id = ?
            ORDER BY job_id DESC
            LIMIT 1
        ");

        $existingJobQuery->execute([$businessId]);
        $existingJob = $existingJobQuery->fetch();

        if ($cleanJob !== null) {
            if ($existingJob) {
                $jobQuery = $pdo->prepare("
                    UPDATE jobs SET
                        job_title = ?,
                        job_description = ?,
                        requirements = ?,
                        responsibilities = ?,
                        qualifications = ?,
                        employment_type = ?,
                        salary = ?,
                        schedule = ?,
                        how_to_apply = ?,
                        location = ?,
                        status = 'approved'
                    WHERE job_id = ?
                ");

                $jobQuery->execute([
                    $cleanJob["title"],
                    $cleanJob["description"],
                    $cleanJob["requirements"],
                    $cleanJob["responsibilities"],
                    $cleanJob["qualifications"],
                    $cleanJob["employment_type"],
                    $cleanJob["salary"],
                    $cleanJob["schedule"],
                    $cleanJob["how_to_apply"],
                    $cleanJob["location"],
                    $existingJob["job_id"]
                ]);

            } else {
                $jobQuery = $pdo->prepare("
                    INSERT INTO jobs (
                        business_id,
                        job_title,
                        job_description,
                        requirements,
                        responsibilities,
                        qualifications,
                        employment_type,
                        salary,
                        schedule,
                        how_to_apply,
                        location,
                        status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
                ");

                $jobQuery->execute([
                    $businessId,
                    $cleanJob["title"],
                    $cleanJob["description"],
                    $cleanJob["requirements"],
                    $cleanJob["responsibilities"],
                    $cleanJob["qualifications"],
                    $cleanJob["employment_type"],
                    $cleanJob["salary"],
                    $cleanJob["schedule"],
                    $cleanJob["how_to_apply"],
                    $cleanJob["location"]
                ]);
            }

        } elseif ($existingJob) {
            $deleteJob = $pdo->prepare("
                DELETE FROM jobs
                WHERE business_id = ?
            ");

            $deleteJob->execute([$businessId]);
        }

        $pdo->commit();

        respond(
            true,
            $input["business_id"] ?? 0 ? "Business updated successfully." : "Business added successfully.",
            [
                "business_id" => $businessId,
                "business" => get_business($pdo, $businessId)
            ]
        );
    }

    respond(false, "Method not allowed.", null, 405);

} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    respond(false, "Something went wrong while saving. " . $e->getMessage(), null, 500);
}
