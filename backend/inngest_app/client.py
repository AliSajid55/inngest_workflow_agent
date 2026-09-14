from dotenv import load_dotenv

load_dotenv()

import inngest  # type: ignore

inngest_client = inngest.Inngest(app_id="ai-decision-flow")
