<div id="top">

<!-- HEADER STYLE: MODERN -->
<div align="center" style="width: 100%;">

<a href="https://kuwaitmart.vercel.app/">
  <img src="./src/assets/favicon.png" width="35%" style="display: block; margin: 0 auto;" alt="Project Logo" />
</a>

<em><em>

<!-- BADGES -->
<img src="https://img.shields.io/github/license/tarekchaalan/kuwaitmart?style=flat&logo=opensourceinitiative&logoColor=white&color=#2D8765" alt="license">
<img src="https://img.shields.io/github/last-commit/tarekchaalan/kuwaitmart?style=flat&logo=git&logoColor=white&color=#2D8765" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/tarekchaalan/kuwaitmart?style=flat&color=#2D8765" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/tarekchaalan/kuwaitmart?style=flat&color=#2D8765" alt="repo-language-count">

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white" alt="JSON">
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white" alt="npm">
<img src="https://img.shields.io/badge/Autoprefixer-DD3735.svg?style=flat&logo=Autoprefixer&logoColor=white" alt="Autoprefixer">
<img src="https://img.shields.io/badge/PostCSS-DD3A0A.svg?style=flat&logo=PostCSS&logoColor=white" alt="PostCSS">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black" alt="JavaScript">
<br>
<img src="https://img.shields.io/badge/Vitest-6E9F18.svg?style=flat&logo=Vitest&logoColor=white" alt="Vitest">
<img src="https://img.shields.io/badge/GNU%20Bash-4EAA25.svg?style=flat&logo=GNU-Bash&logoColor=white" alt="GNU%20Bash">
<img src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black" alt="React">
<img src="https://img.shields.io/badge/Vite-646CFF.svg?style=flat&logo=Vite&logoColor=white" alt="Vite">
<img src="https://img.shields.io/badge/CSS-663399.svg?style=flat&logo=CSS&logoColor=white" alt="CSS">

</div>
</div>
<br clear="right">

---

## Table of Contents

<details>
<summary>Table of Contents</summary>

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
  - [Project Index](#project-index)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Testing](#testing)
- [License](#license)

</details>

---

## Overview

**KuwaitMart: Simplifying E-Commerce Development**

**Why KuwaitMart?**

This project streamlines e-commerce application development with essential features tailored for developers:

- **🔒 Secure payments:** Robust functions in `api/payments`.
- **💼 Admin interface:** Easily create and manage with `admin.html`.
- **🚀 Multi-page React setup:** `vite.config.js` for efficient API proxy.

---

## Features

|     | Component         | Details                                                                                                                        |
| :-- | :---------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| ⚙️  | **Architecture**  | <ul><li>React-based SPA</li><li>Vite for bundling</li><li>Tailwind CSS for styling</li></ul>                                   |
| 🔩  | **Code Quality**  | <ul><li>ESLint for linting</li><li>Prettier for code formatting</li><li>Consistent use of hooks</li></ul>                      |
| 📄  | **Documentation** | <ul><li>Minimal inline comments</li><li>Lacks comprehensive README</li></ul>                                                   |
| 🔌  | **Integrations**  | <ul><li>Supabase for backend services</li><li>React Router for navigation</li></ul>                                            |
| 🧩  | **Modularity**    | <ul><li>Component-based architecture</li><li>Reusable UI components</li></ul>                                                  |
| 🧪  | **Testing**       | <ul><li>Vitest for unit testing</li><li>React Testing Library for UI tests</li><li>Coverage with @vitest/coverage-v8</li></ul> |
| ⚡️ | **Performance**   | <ul><li>Vite for fast builds</li><li>Tree-shaking enabled</li></ul>                                                            |
| 🛡️  | **Security**      | <ul><li>Basic security practices</li><li>No explicit security audits</li></ul>                                                 |
| 📦  | **Dependencies**  | <ul><li>React, React DOM</li><li>Tailwind CSS, PostCSS</li><li>Autoprefixer</li></ul>                                          |
| 🚀  | **Scalability**   | <ul><li>Component reuse</li><li>Scalable CSS with Tailwind</li></ul>                                                           |

````

---

## Project Structure

```sh
└── kuwaitmart/
    ├── LICENSE
    ├── README.md
    ├── admin.html
    ├── api
    │   ├── _utils
    │   │   ├── auth.js
    │   │   ├── money.js
    │   │   ├── payments.js
    │   │   └── supabaseAdmin.js
    │   ├── admin
    │   │   └── products
    │   ├── orders
    │   │   └── delete.js
    │   ├── payments
    │   │   ├── confirm.js
    │   │   ├── expire-pendings.js
    │   │   ├── session-update.js
    │   │   ├── session.js
    │   │   └── verify.js
    │   └── sitemap.js
    ├── index.html
    ├── package.json
    ├── postcss.config.cjs
    ├── robots.txt
    ├── scripts
    │   └── run-tests.sh
    ├── src
    │   ├── App.jsx
    │   ├── admin
    │   │   ├── AdminApp.jsx
    │   │   └── main.jsx
    │   ├── assets
    │   │   ├── click.png
    │   │   ├── creditcard.png
    │   │   ├── favicon.png
    │   │   └── knet.png
    │   ├── components
    │   │   ├── CategoryRow.jsx
    │   │   ├── Footer.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── PayBadge.jsx
    │   │   ├── Primitives.jsx
    │   │   ├── ProductsGrid.jsx
    │   │   ├── RestockNotice.jsx
    │   │   ├── cart
    │   │   └── index.js
    │   ├── hooks
    │   │   └── useRTL.js
    │   ├── i18n
    │   │   └── dict.js
    │   ├── index.css
    │   ├── lib
    │   │   ├── addToCart.js
    │   │   ├── api.js
    │   │   ├── auth.js
    │   │   ├── cart.js
    │   │   ├── data.js
    │   │   ├── helpers.js
    │   │   ├── orders.js
    │   │   ├── seo.js
    │   │   └── supabaseClient.js
    │   ├── main.jsx
    │   ├── pages
    │   │   ├── CheckoutPage.jsx
    │   │   ├── CheckoutReturn.jsx
    │   │   ├── OrdersPage.jsx
    │   │   ├── Privacy.jsx
    │   │   ├── ProductApp.jsx
    │   │   └── ProductPage.jsx
    │   └── state
    │       └── store.js
    ├── tailwind.config.cjs
    ├── tests
    │   ├── admin
    │   │   └── AdminApp.test.jsx
    │   ├── api
    │   │   ├── _utils
    │   │   ├── admin
    │   │   ├── orders
    │   │   ├── payments
    │   │   └── sitemap.test.js
    │   ├── components
    │   │   ├── CartDrawer.test.jsx
    │   │   ├── CategoryRow.test.jsx
    │   │   ├── Footer.test.jsx
    │   │   ├── Navbar.test.jsx
    │   │   ├── PayBadge.test.jsx
    │   │   ├── Primitives.test.jsx
    │   │   ├── ProductsGrid.test.jsx
    │   │   └── index.test.js
    │   ├── hooks
    │   │   └── useRTL.test.jsx
    │   ├── i18n
    │   │   └── dict.test.js
    │   ├── lib
    │   │   ├── addToCart.test.js
    │   │   ├── api.test.js
    │   │   ├── auth.test.js
    │   │   ├── cart.test.js
    │   │   ├── data.test.js
    │   │   ├── helpers.test.js
    │   │   ├── orders.test.js
    │   │   ├── seo.test.js
    │   │   └── supabaseClient.test.js
    │   ├── pages
    │   │   ├── CheckoutPage.test.jsx
    │   │   ├── CheckoutReturn.test.jsx
    │   │   ├── OrdersPage.more.test.jsx
    │   │   ├── OrdersPage.test.jsx
    │   │   ├── Privacy.test.jsx
    │   │   ├── ProductApp.test.jsx
    │   │   └── ProductPage.test.jsx
    │   ├── setup.js
    │   └── state
    │       └── store.test.jsx
    ├── vercel.json
    ├── vite.config.js
    └── vitest.config.js
````

### Project Index

<details open>
	<summary><b><code>KUWAITMART/</code></b></summary>
	<!-- __root__ Submodule -->
	<details>
		<summary><b>__root__</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ __root__</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/index.html'>index.html</a></b></td>
					<td style='padding: 8px;'>- Index.html serves as the entry point for the KuwaitMart web application, establishing the foundational structure for the user interface<br>- It sets up essential metadata for search engine optimization and social media sharing, links to the main JavaScript module, and prepares the environment for rendering the apps components<br>- This file is crucial for ensuring a seamless user experience and effective online presence.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/LICENSE'>LICENSE</a></b></td>
					<td style='padding: 8px;'>- Grants users the freedom to use, modify, and distribute the software with minimal restrictions, fostering collaboration and innovation within the community<br>- The MIT License ensures that the software remains open-source while protecting the author from liability<br>- This licensing choice aligns with the projects goal of encouraging widespread adoption and contribution, making it accessible and beneficial to developers and users alike.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/admin.html'>admin.html</a></b></td>
					<td style='padding: 8px;'>- The admin.html file serves as the entry point for the administrative interface of the KuwaitMart project<br>- It sets up the HTML structure and links to the main JavaScript module responsible for rendering the admin dashboard<br>- By including essential metadata and linking to assets, it ensures proper display and functionality, facilitating efficient management and oversight of the platforms backend operations.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/vercel.json'>vercel.json</a></b></td>
					<td style='padding: 8px;'>- The <code>vercel.json</code> configuration file orchestrates routing and scheduling within the project<br>- It manages URL rewrites to ensure proper navigation, such as directing requests for <code>/sitemap.xml</code> to the appropriate API endpoint<br>- It also sets headers to prevent search engines from indexing admin pages and schedules a cron job to handle payment expiration tasks, maintaining efficient and secure application operations.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/postcss.config.cjs'>postcss.config.cjs</a></b></td>
					<td style='padding: 8px;'>- Configuration of PostCSS plugins enhances the styling process within the codebase<br>- By integrating Tailwind CSS and Autoprefixer, it ensures efficient utility-first CSS development and automatic vendor prefixing for cross-browser compatibility<br>- This setup streamlines the styling workflow, promoting consistency and responsiveness across the project, and aligns with modern web development practices, ultimately contributing to a robust and maintainable front-end architecture.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/vite.config.js'>vite.config.js</a></b></td>
					<td style='padding: 8px;'>- Configure the Vite build tool to enhance the development and build processes of a React application<br>- Enable proxying of API calls to a serverless runtime during development and support a multi-page application structure by specifying multiple HTML entry points<br>- This setup streamlines local development and optimizes the build process for deployment, ensuring efficient handling of both main and admin interfaces.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/vitest.config.js'>vitest.config.js</a></b></td>
					<td style='padding: 8px;'>- Configure the testing environment for the project using Vitest, specifying settings for test execution, environment setup, and mock management<br>- Establishes code coverage parameters, including coverage reporting formats and directories to include or exclude<br>- Sets thresholds for code coverage to ensure quality and prevent regressions<br>- Integrates with the projects architecture by focusing on the <code>src</code> and <code>api</code> directories while excluding non-essential files.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/tailwind.config.cjs'>tailwind.config.cjs</a></b></td>
					<td style='padding: 8px;'>- Defines the configuration for Tailwind CSS, specifying the files to scan for class names and setting up custom screen sizes for responsive design<br>- Integrates seamlessly with the projects architecture by targeting HTML and JavaScript files in the specified directories<br>- Supports the extension of default themes and the addition of plugins, enabling a flexible and scalable approach to styling within the codebase.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/package.json'>package.json</a></b></td>
					<td style='padding: 8px;'>- The <code>package.json</code> file orchestrates the build and development processes of the Kuwait Mart project<br>- It defines scripts for testing, building, and previewing the application using Vite and Vitest<br>- It also specifies dependencies and development tools, including React, Tailwind CSS, and Supabase, ensuring a streamlined workflow for developers<br>- The configuration supports modern browser environments, enhancing compatibility and performance across different platforms.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/robots.txt'>robots.txt</a></b></td>
					<td style='padding: 8px;'>- Regulates web crawler access by allowing general access to the site while restricting entry to administrative sections<br>- Ensures search engines can index the main content effectively, enhancing visibility and user experience<br>- Provides a sitemap link to guide crawlers through the sites structure, optimizing search engine efficiency and ensuring important pages are indexed<br>- Contributes to the overall SEO strategy of the project.</td>
				</tr>
			</table>
		</blockquote>
	</details>
	<!-- scripts Submodule -->
	<details>
		<summary><b>scripts</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ scripts</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/scripts/run-tests.sh'>run-tests.sh</a></b></td>
					<td style='padding: 8px;'>- Facilitates the execution of the Bird‑Mart projects test suite, ensuring code reliability through unit and integration tests<br>- Generates a comprehensive coverage report in both text and HTML formats<br>- Provides guidance for interactive test watching and accessing the Vitest UI, supporting developers in maintaining high-quality code and efficient debugging within the projects architecture.</td>
				</tr>
			</table>
		</blockquote>
	</details>
	<!-- api Submodule -->
	<details>
		<summary><b>api</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ api</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/api/sitemap.js'>sitemap.js</a></b></td>
					<td style='padding: 8px;'>- Generate a dynamic XML sitemap for the BirdMartKWT website by retrieving active product URLs from the Supabase database and combining them with static page URLs<br>- This sitemap enhances SEO by providing search engines with up-to-date information on available products and site structure<br>- It includes caching headers to optimize performance and ensure timely updates while maintaining efficient resource usage.</td>
				</tr>
			</table>
			<!-- _utils Submodule -->
			<details>
				<summary><b>_utils</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ api._utils</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/api/_utils/money.js'>money.js</a></b></td>
							<td style='padding: 8px;'>- Rounding functionality for Kuwaiti Dinar (KWD) values is provided to ensure monetary amounts are consistently formatted to three decimal places<br>- This utility is crucial for maintaining financial accuracy across the application, especially in calculations and displays involving currency<br>- By standardizing the rounding process, it supports the broader financial operations within the projects architecture, enhancing reliability and precision in monetary transactions.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/api/_utils/auth.js'>auth.js</a></b></td>
							<td style='padding: 8px;'>- Facilitates user authentication by leveraging Supabases client to retrieve user information based on authorization tokens<br>- Integrates with request headers and cookies to extract the token, ensuring seamless user identification within the application<br>- Plays a critical role in managing user sessions and securing API endpoints, contributing to the overall security and user management strategy of the codebase.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/api/_utils/supabaseAdmin.js'>supabaseAdmin.js</a></b></td>
							<td style='padding: 8px;'>- Facilitates server-side interactions with Supabase by creating a client instance using environment variables for secure access<br>- Ensures that the client is only instantiated in a server environment and verifies the presence of necessary environment variables<br>- Provides a function to retrieve the Supabase client, raising an error if the required configuration is missing, thereby maintaining robust server-only database operations within the codebase.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/api/_utils/payments.js'>payments.js</a></b></td>
							<td style='padding: 8px;'>- Facilitates payment management within the application by providing utilities to handle payment records and events safely<br>- It ensures seamless operation even if the payments schema is not fully established<br>- Key functionalities include inserting and updating payment details, logging payment events, and updating order statuses, all while gracefully handling potential errors to maintain application stability.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- payments Submodule -->
			<details>
				<summary><b>payments</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ api.payments</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/api/payments/session.js'>session.js</a></b></td>
							<td style='padding: 8px;'>- Handles the creation of payment sessions for orders by integrating with the Click payment gateway<br>- It validates order details, generates a unique order ID, and communicates with the Click API to initiate a payment session<br>- Upon successful session creation, it updates the order with session details and logs payment events, ensuring seamless payment processing within the applications architecture.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/api/payments/session-update.js'>session-update.js</a></b></td>
							<td style='padding: 8px;'>- Handles payment session updates by interacting with the Click payment gateway<br>- Validates request methods, retrieves and verifies order details, and constructs a request to update the payment session<br>- Manages responses from the gateway, including redirects and errors, updating the order status accordingly<br>- Ensures seamless payment processing by constructing appropriate URLs for redirection based on available data and environment configurations.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/api/payments/expire-pendings.js'>expire-pendings.js</a></b></td>
							<td style='padding: 8px;'>- Expire-pendings.js manages stale pending orders by marking them as failed or cancelled if users do not complete the payment process within a specified timeframe<br>- It operates via GET or POST requests, defaulting to a 60-minute threshold<br>- By updating the status of these orders and associated payments, it ensures the system maintains accurate and up-to-date order statuses, enhancing overall payment processing reliability.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/api/payments/verify.js'>verify.js</a></b></td>
							<td style='padding: 8px;'>- Handles payment verification by interacting with the Click API to check the payment status of an order<br>- Utilizes environment variables for authentication and updates the order status in the database based on the payment outcome<br>- Ensures robust error handling and updates payment records accordingly, facilitating seamless integration with the payment gateway and maintaining accurate order and payment status within the system.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/api/payments/confirm.js'>confirm.js</a></b></td>
							<td style='padding: 8px;'>- Handles the confirmation of payment statuses for orders by interacting with the Click payment gateway<br>- It verifies order details, updates order statuses based on gateway responses, and manages payment events<br>- Additionally, it ensures the synchronization of session IDs and updates coupon usage counts upon successful payment confirmation, contributing to the overall payment processing workflow within the codebase.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- orders Submodule -->
			<details>
				<summary><b>orders</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ api.orders</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/api/orders/delete.js'>delete.js</a></b></td>
							<td style='padding: 8px;'>- Handles the deletion of orders within the system by accepting POST or DELETE requests<br>- Validates the presence of an order ID and ensures the order exists before proceeding<br>- Executes a strict cascade deletion, removing associated payment events, payments, and order items before deleting the order itself<br>- Provides error handling and returns a response indicating success or failure, with detailed error information in development mode.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- admin Submodule -->
			<details>
				<summary><b>admin</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ api.admin</b></code>
					<!-- products Submodule -->
					<details>
						<summary><b>products</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ api.admin.products</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/api/admin/products/upsert.js'>upsert.js</a></b></td>
									<td style='padding: 8px;'>- Handles the upsert operation for product data within the admin API, ensuring only authenticated users with admin roles can perform the action<br>- Validates request payloads and interacts with the Supabase database to insert or update product records<br>- Provides appropriate HTTP responses based on the operations success or failure, with additional error handling tailored for development and production environments.</td>
								</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<!-- src Submodule -->
	<details>
		<summary><b>src</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ src</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/index.css'>index.css</a></b></td>
					<td style='padding: 8px;'>- Enhances the user interface by incorporating Tailwind CSS for styling and providing animations for checkmark elements<br>- The CSS file defines animations for SVG checkmarks, including stroke and fill effects, to visually indicate successful actions<br>- It also includes a compact variant for smaller buttons, ensuring consistent and visually appealing feedback across different components within the project.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/main.jsx'>main.jsx</a></b></td>
					<td style='padding: 8px;'>- Initialize the React application by setting up the root rendering process<br>- Establishes the applications entry point and integrates React Router for client-side navigation<br>- Ensures the entire application is wrapped in Reacts StrictMode for highlighting potential issues<br>- Routes all paths to the main App component, providing a centralized location for managing the application's routing logic and enhancing maintainability across the codebase.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/App.jsx'>App.jsx</a></b></td>
					<td style='padding: 8px;'>- Serve as the main entry point for a React-based e-commerce application, orchestrating the overall user interface and navigation<br>- It integrates key components such as the Navbar, Footer, and CartDrawer, and manages routing between pages like the home, product, checkout, and orders<br>- It also handles language settings and applies SEO optimizations for product pages, ensuring a seamless shopping experience.</td>
				</tr>
			</table>
			<!-- admin Submodule -->
			<details>
				<summary><b>admin</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.admin</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/admin/AdminApp.jsx'>AdminApp.jsx</a></b></td>
							<td style='padding: 8px;'>- The <code>AdminApp.jsx</code> file serves as the core component of the admin dashboard for the project<br>- Its primary purpose is to provide a secure and efficient interface for administrators to manage various aspects of the application, including categories, products, coupons, and orders<br>- The file ensures that only authorized users, whose emails are listed in the <code>public.admins</code> table, can access the dashboard by implementing a login system using Supabases email/password authentication<br>- This system prevents unauthorized access by blocking users not verified as admins, even if they have valid credentials.The admin dashboard supports multiple languages (EN/AR) and includes features such as inventory management, discount handling, and active toggles for different entities<br>- It is designed to be integrated seamlessly into the existing project structure, leveraging TailwindCSS for styling<br>- Additionally, the file emphasizes the importance of disabling email self-signups in Supabase to maintain strict control over admin access, suggesting that admin users should be manually added via the Supabase dashboard or API.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/admin/main.jsx'>main.jsx</a></b></td>
							<td style='padding: 8px;'>- Initializes the admin interface of the application by rendering the AdminApp component within a strict mode environment<br>- This setup ensures that the admin-specific functionalities are encapsulated and managed separately from the main user-facing components, promoting modularity and maintainability within the projects architecture<br>- It serves as the entry point for all administrative operations, enhancing the overall structure and scalability of the application.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- state Submodule -->
			<details>
				<summary><b>state</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.state</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/state/store.js'>store.js</a></b></td>
							<td style='padding: 8px;'>- Manage application state by providing hooks for user authentication, cart management, and UI settings<br>- It initializes and updates state variables such as language, query, active category, cart details, and user information<br>- It also listens for authentication state changes and loads user and cart data accordingly, ensuring a seamless user experience across different components of the application.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- components Submodule -->
			<details>
				<summary><b>components</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.components</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/components/ProductsGrid.jsx'>ProductsGrid.jsx</a></b></td>
							<td style='padding: 8px;'>- ProductsGrid.jsx serves as the main component for displaying a grid of products in an e-commerce application<br>- It manages product data fetching, category filtering, and pagination<br>- The component also handles user interactions such as adding products to the cart and navigating to product details<br>- By integrating various subcomponents and utility functions, it provides a seamless shopping experience with dynamic content updates based on user actions and preferences.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/components/Footer.jsx'>Footer.jsx</a></b></td>
							<td style='padding: 8px;'>- The Footer component enhances the user interface by providing essential information and navigation links at the bottom of the KuwaitMart website<br>- It includes company branding, support contact details, and payment options, contributing to a cohesive and informative user experience<br>- This component plays a crucial role in maintaining user engagement and accessibility, aligning with the overall architecture of the web application.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/components/index.js'>index.js</a></b></td>
							<td style='padding: 8px;'>- Centralizes the export of key UI components, facilitating streamlined imports across the codebase<br>- By aggregating components like Navbar, CategoryRow, ProductsGrid, Footer, and CartDrawer, along with primitives, it enhances modularity and maintainability<br>- This structure supports a cohesive architecture, allowing developers to efficiently manage and utilize UI elements, promoting consistency and reducing redundancy in the projects component management.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/components/PayBadge.jsx'>PayBadge.jsx</a></b></td>
							<td style='padding: 8px;'>- PayBadge component enhances the user interface by providing a visually distinct badge element that displays a label<br>- It integrates seamlessly within the broader component architecture, offering a consistent design language with its styling<br>- This component is particularly useful for highlighting payment-related information or statuses, contributing to a cohesive and intuitive user experience across the application.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/components/CategoryRow.jsx'>CategoryRow.jsx</a></b></td>
							<td style='padding: 8px;'>- CategoryRow.jsx enhances user navigation by dynamically displaying category options as interactive buttons<br>- It fetches category data and updates the user interface to reflect the current selection, allowing users to filter products based on categories<br>- This component integrates seamlessly with the applications state management, ensuring a responsive and intuitive user experience across different languages and categories within the broader application architecture.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/components/Navbar.jsx'>Navbar.jsx</a></b></td>
							<td style='padding: 8px;'>- The <code>Navbar.jsx</code> component manages user authentication and navigation within the application<br>- It provides a user interface for logging in, signing up, and logging out, while also handling language switching and search functionality<br>- The component integrates with the authentication and cart systems to ensure a seamless user experience, including merging guest data upon successful login or signup.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/components/Primitives.jsx'>Primitives.jsx</a></b></td>
							<td style='padding: 8px;'>- Primitives.jsx provides foundational UI components for the project, including a Badge for displaying status indicators, an Icon component for rendering various icons using react-icons, and a QtyButton for interactive quantity adjustments<br>- These components enhance the user interface by offering reusable, styled elements that maintain consistency across the application, contributing to a cohesive and efficient design system.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/components/RestockNotice.jsx'>RestockNotice.jsx</a></b></td>
							<td style='padding: 8px;'>- RestockNotice component provides a user interface element to inform users about product availability updates<br>- It supports multilingual display, offering messages in English and Arabic, and adjusts its size and styling based on specified parameters<br>- Integrated within the broader application, it enhances user experience by dynamically showing or hiding notifications about restocking timelines, contributing to effective communication with users regarding product availability.</td>
						</tr>
					</table>
					<!-- cart Submodule -->
					<details>
						<summary><b>cart</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.components.cart</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/components/cart/CartDrawer.jsx'>CartDrawer.jsx</a></b></td>
									<td style='padding: 8px;'>- CartDrawer.jsx manages the user interface for the shopping cart in the application<br>- It provides a dynamic and interactive drawer component that displays cart items, allowing users to adjust quantities or remove items<br>- It calculates and displays the subtotal and total amounts, incorporating any discounts<br>- The component also facilitates navigation to the checkout process, enhancing the overall shopping experience.</td>
								</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<!-- hooks Submodule -->
			<details>
				<summary><b>hooks</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.hooks</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/hooks/useRTL.js'>useRTL.js</a></b></td>
							<td style='padding: 8px;'>- Facilitates dynamic adjustment of text direction and language attributes on a webpage based on the provided language input<br>- By leveraging the React hook useEffect, it ensures that the documents HTML element is updated to support right-to-left (RTL) or left-to-right (LTR) text flow, enhancing the user interface for languages like Arabic<br>- This functionality is crucial for maintaining accessibility and localization within the application.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- lib Submodule -->
			<details>
				<summary><b>lib</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.lib</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/lib/orders.js'>orders.js</a></b></td>
							<td style='padding: 8px;'>- Facilitates the merging of guest orders into a users account by updating order records with the users ID and email<br>- Enhances the user experience by ensuring that orders made as a guest are associated with the user's account upon login<br>- Plays a crucial role in maintaining continuity and data integrity within the e-commerce platform's order management system.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/lib/cart.js'>cart.js</a></b></td>
							<td style='padding: 8px;'>- Manage shopping cart functionality within the application by handling operations such as retrieving or creating active carts, adding items, setting quantities, removing items, and clearing the cart<br>- It supports both guest and authenticated user sessions, ensuring seamless transitions by merging guest carts into user carts upon login<br>- Integration with Supabase facilitates database interactions and remote procedure calls for efficient cart management.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/lib/auth.js'>auth.js</a></b></td>
							<td style='padding: 8px;'>- Facilitates user authentication and profile management within the application by providing functions for signing up, signing in, signing out, and updating user profiles<br>- Integrates with Supabase for authentication and database operations, ensuring user data is securely handled<br>- Supports address composition and manages pending profile updates for users awaiting email confirmation, enhancing the overall user experience and data consistency across sessions.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/lib/seo.js'>seo.js</a></b></td>
							<td style='padding: 8px;'>- Enhances single-page applications by managing SEO elements such as the page title, meta tags, canonical links, and structured data using JSON-LD<br>- Specifically tailored for product pages, it dynamically updates Open Graph and Twitter metadata to improve social media sharing and search engine visibility<br>- This functionality ensures that product information is accurately represented across various platforms, contributing to a cohesive digital presence.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/lib/addToCart.js'>addToCart.js</a></b></td>
							<td style='padding: 8px;'>- Facilitates the addition of products to a users cart by interacting with a Supabase remote procedure call<br>- Enhances user experience through an optimistic UI update, reflecting changes immediately<br>- Integrates with the broader e-commerce system by managing guest sessions and product details, ensuring seamless cart operations<br>- Supports dynamic product options and pricing, contributing to the overall shopping functionality within the application.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/lib/data.js'>data.js</a></b></td>
							<td style='padding: 8px;'>- Defines and organizes product categories and generates a list of seed products for a bird-related e-commerce platform<br>- Categories include various bird care and accessory items, each with English and Arabic names<br>- Seed products are created with attributes such as category association, pricing, discounts, and availability of options<br>- This data structure supports the broader application by providing foundational data for inventory management and user interface display.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/lib/supabaseClient.js'>supabaseClient.js</a></b></td>
							<td style='padding: 8px;'>- The <code>supabaseClient.js</code> module establishes a connection to the Supabase backend, managing authentication and session persistence for the Kuwaitmart application<br>- It ensures a consistent client instance across hot module reloads and facilitates guest user identification through cookies<br>- Additionally, it provides utility functions for accessing the Supabase client, retrieving cart tokens, and testing the presence of guest cookies in requests.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/lib/helpers.js'>helpers.js</a></b></td>
							<td style='padding: 8px;'>- Helpers.js provides utility functions for formatting currency and calculating discounted prices within the project<br>- It enhances the codebase by offering a standardized way to display Kuwaiti Dinar values and apply percentage-based discounts to prices<br>- These functions contribute to maintaining consistency and accuracy in financial computations across the application, supporting the overall architecture by centralizing common operations.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/lib/api.js'>api.js</a></b></td>
							<td style='padding: 8px;'>- The <code>api.js</code> module serves as a key interface for interacting with the database, enabling the retrieval and management of categories, products, and orders<br>- It facilitates fetching product details by ID or slug, validating coupon codes, and creating orders<br>- By leveraging Supabase, it ensures efficient data handling and supports pagination, search, and filtering functionalities to enhance the overall e-commerce experience.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- i18n Submodule -->
			<details>
				<summary><b>i18n</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.i18n</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/i18n/dict.js'>dict.js</a></b></td>
							<td style='padding: 8px;'>- Provides multilingual support for the application by defining a dictionary of key-value pairs for English and Arabic translations<br>- Facilitates seamless user experience across different languages by enabling dynamic text rendering based on user preferences<br>- Plays a crucial role in the internationalization (i18n) strategy of the codebase, ensuring accessibility and usability for a diverse user base.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- pages Submodule -->
			<details>
				<summary><b>pages</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.pages</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/pages/ProductPage.jsx'>ProductPage.jsx</a></b></td>
							<td style='padding: 8px;'>- ProductPage.jsx serves as the main interface for displaying detailed product information within the application<br>- It dynamically fetches product data based on the URL slug, presenting users with images, descriptions, and pricing details<br>- The component supports language localization and handles product variants, allowing users to add items to their cart<br>- It enhances user experience by managing loading states and displaying discounts when applicable.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/pages/Privacy.jsx'>Privacy.jsx</a></b></td>
							<td style='padding: 8px;'>- The Privacy.jsx component presents KuwaitMarts Privacy Policy, detailing how customer data is collected, used, and protected<br>- It outlines data types collected, purposes for collection, legal bases for processing, and customer rights<br>- This page is crucial for ensuring transparency and compliance with data protection regulations, enhancing user trust and safeguarding personal information within the broader e-commerce platform.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/pages/ProductApp.jsx'>ProductApp.jsx</a></b></td>
							<td style='padding: 8px;'>- ProductApp.jsx orchestrates the main layout and functionality of the product application page by integrating key components such as Navbar, CategoryRow, ProductPage, Footer, and CartDrawer<br>- It leverages global state management and localization to provide a dynamic and responsive user interface<br>- The file ensures a cohesive user experience by applying consistent styling and language settings across the application, enhancing usability and accessibility.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/pages/CheckoutReturn.jsx'>CheckoutReturn.jsx</a></b></td>
							<td style='padding: 8px;'>- CheckoutReturn.jsx manages the user experience following a payment attempt by determining the payment status and updating the UI accordingly<br>- It interacts with the backend to confirm payment status, updates the order and cart information, and adjusts the language settings based on user preferences<br>- The component provides feedback to users, guiding them through successful payments or offering options to retry or continue shopping if payment fails.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/pages/CheckoutPage.jsx'>CheckoutPage.jsx</a></b></td>
							<td style='padding: 8px;'>- The <code>CheckoutPage.jsx</code> file is a crucial component of the e-commerce application, serving as the user interface for the checkout process<br>- It integrates various functionalities to facilitate a seamless purchasing experience<br>- The page is responsible for displaying the users cart items, calculating totals, and applying discounts through coupon codes<br>- It leverages helper functions to format prices and compute discounts, ensuring accurate financial transactions<br>- Additionally, it interacts with the backend to create orders and validate coupons, while also managing user authentication states<br>- The page ensures that users are informed of stock availability through restock notices and provides options to modify cart contents, such as adjusting quantities or removing items<br>- Overall, this file plays a central role in the transaction flow, bridging the gap between the user's shopping cart and the final order submission.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/tarekchaalan/kuwaitmart/blob/master/src/pages/OrdersPage.jsx'>OrdersPage.jsx</a></b></td>
							<td style='padding: 8px;'>- OrdersPage.jsx serves as the user interface for displaying and managing customer orders within the application<br>- It retrieves order data from the database based on user credentials or guest identifiers and presents it in a tabular format<br>- Users can view detailed information about each order, including status, payment method, and order items, enhancing the overall user experience by providing a comprehensive view of their purchase history.</td>
						</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
</details>

---

## Getting Started

### Prerequisites

This project requires the following dependencies:

- **Programming Language:** JavaScript
- **Package Manager:** Npm

### Installation

Build kuwaitmart from the source and intsall dependencies:

1. **Clone the repository:**

   ```sh
   ❯ git clone https://github.com/tarekchaalan/kuwaitmart
   ```

2. **Navigate to the project directory:**

   ```sh
   ❯ cd kuwaitmart
   ```

3. **Install the dependencies:**

<!-- SHIELDS BADGE CURRENTLY DISABLED -->

    <!-- [![npm][npm-shield]][npm-link] -->
    <!-- REFERENCE LINKS -->
    <!-- [npm-shield]: https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white -->
    <!-- [npm-link]: https://www.npmjs.com/ -->

    **Using [npm](https://www.npmjs.com/):**

    ```sh
    ❯ npm install
    ```

### Usage

Run the project with:

**Using [npm](https://www.npmjs.com/):**

```sh
npm start
```

### Testing

Kuwaitmart uses the {**test_framework**} test framework. Run the test suite with:

**Using [npm](https://www.npmjs.com/):**

```sh
npm test
```

---

## License

KuwaitMart is protected under the MIT License. For more details, refer to the [LICENSE](./LICENSE) file.

<div align="right">

[![][back-to-top]](#top)

</div>

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square

---
