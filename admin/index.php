<?php
require_once __DIR__ . "/auth.php";

$adminUsername = $_SESSION["admin_username"] ?? "";

$adminRole = ($adminUsername === "Admin02")
    ? "Assistant"
    : "Admin";

$avatarLabel = ($adminRole === "Assistant")
    ? "AS"
    : "AD";
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin | LandayanFinds</title>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Secular+One&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="style.css">

    <style>
    .logout-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        padding: 13px 16px;
        border: 1px solid #f0d4d2;
        border-radius: 8px;
        background: #fff5f4;
        color: #c14d47;
        font-family: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .logout-btn span {
        font-size: 17px;
    }

    .logout-btn:hover {
        background: #c14d47;
        border-color: #c14d47;
        color: #ffffff;
    }

    .logout-btn:active {
        transform: scale(0.98);
    }
    </style>
</head>

<body>

    <div class="layout">

        <aside class="sidebar">
            <a class="logo">Landayan<span>Finds</span></a>
            <p class="side-label">ADMIN PANEL</p>

            <nav>
                <button class="nav-btn active" data-tab="approvals">
                    <span>✓</span> Business Approvals
                    <span class="nav-count" id="pending-count">0</span>
                </button>

                <button class="nav-btn" data-tab="businesses">
                    <span>▦</span> All Businesses
                </button>
            </nav>

            <div class="sidebar-bottom">
                <div class="admin-profile">
                    <div class="avatar"><?= htmlspecialchars($avatarLabel, ENT_QUOTES, "UTF-8") ?></div>

                    <div>
                        <strong>
                            <?= htmlspecialchars($adminRole, ENT_QUOTES, "UTF-8") ?>
                        </strong>
                        <small>
                            <?= htmlspecialchars($adminUsername, ENT_QUOTES, "UTF-8") ?>
                        </small>
                    </div>
                </div>

                <button class="logout-btn" id="logout-btn">
                    <span>↪</span> Logout
                </button>
            </div>
        </aside>

        <main class="main">

            <header class="topbar">
                <div>
                    <h1 id="page-title">Business Approvals</h1>
                    <p id="page-subtitle">Review and manage business applications.</p>
                </div>

                <span class="admin-badge">
                    <?= htmlspecialchars(strtoupper($adminRole), ENT_QUOTES, "UTF-8") ?>
                </span>
            </header>

            <section class="stats">

                <div class="stat-card">
                    <span>Total Businesses</span>
                    <h2 id="total-stat">0</h2>
                    <small>Approved and published businesses</small>
                </div>

                <div class="stat-card pending-stat">
                    <span>Pending Approvals</span>
                    <h2 id="pending-stat">0</h2>
                    <small>Waiting for admin review</small>
                </div>

            </section>

            <section class="content-section active" id="approvals">

                <div class="section-heading">
                    <div>
                        <h2>Business Applications</h2>
                        <p>Review submitted businesses before publishing them.</p>
                    </div>

                    <span class="section-count" id="approval-label">0 Pending</span>
                </div>

                <div id="approval-list" class="business-list"></div>

            </section>

            <section class="content-section" id="businesses">

                <div class="section-heading">
                    <div>
                        <h2>All Businesses</h2>
                        <p>View and manage approved and published businesses.</p>
                    </div>
                </div>

                <div class="filters">

                    <input type="search" id="search-input" placeholder="Search business name...">

                    <select id="category-filter">
                        <option value="all">All Categories</option>
                        <option>Food and Beverages</option>
                        <option>Stores</option>
                        <option>Services</option>
                        <option>Health &amp; Wellness</option>
                        <option>Others</option>
                    </select>

                </div>

                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Business</th>
                                <th>Category</th>
                                <th>Owner</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody id="business-table"></tbody>
                    </table>
                </div>

                <p class="table-count" id="table-count">
                    Showing 0 businesses
                </p>

            </section>

        </main>

    </div>

    <script src="script.js"></script>

</body>

</html>