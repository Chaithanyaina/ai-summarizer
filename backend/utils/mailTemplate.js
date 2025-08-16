// backend/utils/mailTemplate.js

/**
 * Generates an HTML email template with the provided summary content.
 * @param {string} summaryHtml - The summary content already converted to HTML.
 * @returns {string} The full HTML email body.
 */
export const createHtmlEmail = (summaryHtml) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
          margin: 0;
          padding: 0;
          background-color: #f4f4f7;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background-color: #4A90E2;
          color: #ffffff;
          padding: 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 32px;
          line-height: 1.6;
        }
        .content ul {
          padding-left: 20px;
        }
        .content li {
          margin-bottom: 10px;
        }
        .footer {
          background-color: #f4f4f7;
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Meeting Summary</h1>
        </div>
        <div class="content">
          ${summaryHtml}
        </div>
        <div class="footer">
          <p>Shared from the AI Summarizer App</p>
        </div>
      </div>
    </body>
    </html>
  `;
};