from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

import inngest  # type: ignore

inngest_client = inngest.Inngest(app_id="ai-decision-flow")
