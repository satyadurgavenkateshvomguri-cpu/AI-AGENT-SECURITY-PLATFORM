from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.reports.pdf_generator import ReportGenerator

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{agent_id}")
def get_report_json(agent_id: int, db: Session = Depends(get_db)):
    try:
        report_data = ReportGenerator.generate_report_data(db=db, agent_id=agent_id)
        return report_data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{agent_id}/generate")
def generate_printable_report(agent_id: int, db: Session = Depends(get_db)):
    try:
        data = ReportGenerator.generate_report_data(db=db, agent_id=agent_id)

        # Build clean styled HTML view suitable for browser rendering or print to PDF
        results_rows = "".join([
            f"""
            <tr>
                <td style="padding:10px; border-bottom:1px solid #334155; color:#94a3b8; font-weight:bold;">{r['test_id']}</td>
                <td style="padding:10px; border-bottom:1px solid #334155;">{r['name']}</td>
                <td style="padding:10px; border-bottom:1px solid #334155; color:#64748b;">{r['category']}</td>
                <td style="padding:10px; border-bottom:1px solid #334155;"><span style="padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px; background:{'#059669' if r['status']=='PASS' else '#dc2626' if r['status']=='FAIL' else '#d97706'}; color:#fff;">{r['status']}</span></td>
                <td style="padding:10px; border-bottom:1px solid #334155; font-weight:bold;">{r['severity']}</td>
            </tr>
            """ for r in data["results"]
        ])

        recs_html = "".join([
            f"""
            <div style="background:#1e293b; padding:15px; border-left:4px solid {'#ef4444' if rec['priority']=='HIGH' else '#f59e0b'}; border-radius:6px; margin-bottom:12px;">
                <div style="font-weight:bold; color:#f8fafc;">[{rec['priority']}] {rec['finding']}</div>
                <div style="color:#94a3b8; margin-top:6px; font-size:14px;"><strong>Remediation:</strong> {rec['recommendation']}</div>
            </div>
            """ for rec in data["recommendations"]
        ])

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{data['title']}</title>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#0f172a; color:#f8fafc; padding:40px; line-height:1.6; }}
                .header {{ border-bottom:2px solid #38bdf8; padding-bottom:20px; margin-bottom:30px; }}
                .badge {{ font-size:18px; padding:6px 14px; border-radius:6px; font-weight:bold; display:inline-block; }}
                .badge-CRITICAL {{ background:#ef4444; color:#fff; }}
                .badge-HIGH {{ background:#f97316; color:#fff; }}
                .badge-MEDIUM {{ background:#eab308; color:#000; }}
                .badge-LOW {{ background:#3b82f6; color:#fff; }}
                .badge-SECURE {{ background:#10b981; color:#fff; }}
                table {{ width:100%; border-collapse:collapse; margin-top:20px; background:#1e293b; border-radius:8px; overflow:hidden; }}
                th {{ background:#334155; padding:12px; text-align:left; color:#cbd5e1; }}
                .card {{ background:#1e293b; padding:20px; border-radius:8px; margin-bottom:20px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>AI AGENT SECURITY ASSESSMENT REPORT</h1>
                <h3>Agent: {data['agent_info']['name']} (ID: {data['agent_info']['id']})</h3>
                <p>Generated At: {data['generated_at']}</p>
            </div>

            <div class="card">
                <h2>EXECUTIVE SUMMARY</h2>
                <p>Overall Security Risk Level: <span class="badge badge-{data['risk_summary']['overall_risk_level']}">{data['risk_summary']['overall_risk_level']} ({data['risk_summary']['overall_risk_score']}%)</span></p>
                <p>Total Tests Executed: <strong>{data['risk_summary']['total_tests']}</strong> | Passed: <strong style="color:#10b981;">{data['risk_summary']['passed_tests']}</strong> | Failed/Blocked: <strong style="color:#ef4444;">{data['risk_summary']['failed_tests']}</strong></p>
            </div>

            <div class="card">
                <h2>AGENT CONFIGURATION METRIX</h2>
                <ul>
                    <li><strong>LLM Model:</strong> {data['agent_info']['llm_provider']} / {data['agent_info']['model']}</li>
                    <li><strong>Data Access Level:</strong> {data['agent_info']['data_access_level']}</li>
                    <li><strong>Max Tool Calls:</strong> {data['agent_info']['max_tool_calls']}</li>
                    <li><strong>Permitted Tools:</strong> {', '.join(data['agent_info']['permissions']) if data['agent_info']['permissions'] else 'None'}</li>
                </ul>
            </div>

            <div class="card">
                <h2>DETAILED SECURITY FINDINGS</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Test ID</th>
                            <th>Test Name</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Severity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results_rows}
                    </tbody>
                </table>
            </div>

            <div class="card">
                <h2>REMEDIATION ROADMAP & RECOMMENDATIONS</h2>
                {recs_html}
            </div>
        </body>
        </html>
        """
        return HTMLResponse(content=html_content)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
