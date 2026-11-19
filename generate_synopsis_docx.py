import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

# --- 1. GENERATE FLOWCHART IMAGE ---
def generate_flowchart(output_path):
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 8)
    ax.axis('off')

    # Color Palette
    navy = '#0F172A'
    blue = '#1E3A8A'
    cyan = '#0284C7'
    emerald = '#059669'
    amber = '#D97706'
    purple = '#7C3AED'
    rose = '#E11D48'
    slate = '#F8FAFC'
    border_col = '#334155'

    def draw_box(x, y, w, h, text, color, text_col='white', fontsize=9, bold=True, shape='rect'):
        if shape == 'round':
            box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.15,rounding_size=0.2",
                                         ec=border_col, fc=color, lw=1.5, zorder=3)
        elif shape == 'diamond':
            pts = [[x + w/2, y], [x + w, y + h/2], [x + w/2, y + h], [x, y + h/2]]
            box = patches.Polygon(pts, closed=True, ec=border_col, fc=color, lw=1.5, zorder=3)
        else:
            box = patches.Rectangle((x, y), w, h, ec=border_col, fc=color, lw=1.5, zorder=3)
        ax.add_patch(box)
        weight = 'bold' if bold else 'normal'
        ax.text(x + w/2, y + h/2, text, ha='center', va='center',
                color=text_col, fontsize=fontsize, fontweight=weight, zorder=4, linespacing=1.2)

    def draw_arrow(x1, y1, x2, y2, text='', text_offset=(0, 0)):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="-|>", color='#1E293B', lw=1.6, mutation_scale=14),
                    zorder=2)
        if text:
            mx, my = (x1 + x2)/2 + text_offset[0], (y1 + y2)/2 + text_offset[1]
            ax.text(mx, my, text, fontsize=7.5, fontweight='bold', color='#1E293B', ha='center', va='center',
                    bbox=dict(boxstyle='round,pad=0.2', facecolor='white', edgecolor='#CBD5E1', lw=0.8), zorder=5)

    # Background frame
    bg = patches.FancyBboxPatch((0.1, 0.1), 10.8, 7.8, boxstyle="round,pad=0.1,rounding_size=0.15",
                                ec="#E2E8F0", fc="#F8FAFC", lw=1.2, zorder=1)
    ax.add_patch(bg)

    # Title Banner
    ax.text(5.5, 7.55, "ODYSSEY: ARCHIPELAGO ARCHITECTURE & EVALUATION PIPELINE",
            ha='center', va='center', fontsize=12, fontweight='bold', color='#0F172A')

    # Top flow: Start -> Landing -> Map
    draw_box(0.5, 6.7, 1.8, 0.6, "User Session Start", "#334155", shape='round', fontsize=8.5)
    draw_arrow(2.3, 7.0, 3.0, 7.0)

    draw_box(3.0, 6.6, 2.3, 0.8, "Landing Briefing\n(Stranded Navigator)", "#1E293B", fontsize=8.5)
    draw_arrow(5.3, 7.0, 6.1, 7.0)

    draw_box(6.1, 6.55, 4.4, 0.9, "Archipelago Navigation Chart\n(World Map & Route Unlock Engine)", "#0369A1", fontsize=9)

    # Challenge Islands Grouping Frame
    island_bg = patches.Rectangle((0.4, 3.2), 10.2, 2.9, ec="#94A3B8", fc="#EFF6FF", lw=1.2, linestyle='--', zorder=2)
    ax.add_patch(island_bg)
    ax.text(0.6, 5.9, "SIX AUTONOMOUS TRIAL ISLANDS & MODEL ENGINES", fontsize=8.5, fontweight='bold', color="#1E3A8A")

    # Connect Map down to island frame
    draw_arrow(8.3, 6.55, 8.3, 6.1)

    # 6 Islands
    islands = [
        ("Island 01: Predictor\nRandom Forest &\nIsolation Forest", cyan, 0.6),
        ("Island 02: Mirror\nVision Transformer\n(ViT Face Emotion)", purple, 2.3),
        ("Island 03: Observer\nMobileNetV3-SSD\nDrone Object Detect", amber, 4.0),
        ("Island 04: Voices\nDistilBERT SST-2\nAttention Highlights", emerald, 5.7),
        ("Island 05: Decision\nRL Grid-World MDP\nBellman Q(s, a)", rose, 7.4),
        ("Island 06: Archive\nRAG Ingestion &\nFAISS IndexFlatIP", "#4F46E5", 9.1)
    ]

    for name, col, x_pos in islands:
        draw_box(x_pos, 3.4, 1.5, 2.3, name, col, fontsize=8)

    # Flow down to Core Evaluation Engine
    eval_y = 1.9
    draw_box(0.6, eval_y, 4.2, 0.9, "Telemetry & Evaluation Engine\n(Cosine Sim / Softmax / IoU / Q-Values)", "#1E293B", fontsize=8.5)
    draw_arrow(5.5, 3.4, 2.7, 2.8)

    draw_box(5.2, eval_y, 2.5, 0.9, "Scoring & DDA\n(Streak & Difficulty)", "#0D9488", fontsize=8.5)
    draw_arrow(4.8, 2.35, 5.2, 2.35)

    draw_box(8.2, eval_y, 2.3, 0.9, "Challenge Solved?\n(Accuracy Threshold)", "#CA8A04", shape='diamond', fontsize=7.5)
    draw_arrow(7.7, 2.35, 8.2, 2.35)

    # Evaluation results branch
    # If No -> Retry / Feedback
    draw_arrow(9.35, 2.8, 9.35, 3.4, "Retry (DDA Adj)", text_offset=(0, 0))

    # If Yes -> Award Relic & Check Home
    draw_box(6.2, 0.4, 2.5, 0.9, "Award Island Relic &\nUpdate Persistent DB", "#059669", fontsize=8.5)
    draw_arrow(9.35, 1.9, 8.7, 0.85, "Passed")

    draw_box(0.6, 0.4, 4.5, 0.9, "Home Sanctuary Conquered\n(6 Relics Core Assembly & Fanfare)", "#B45309", shape='round', fontsize=9)
    draw_arrow(6.2, 0.85, 5.1, 0.85, "All 6 Conquered")

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Flowchart generated successfully at: {output_path}")

# --- 2. BUILD THE WORD DOCUMENT (.DOCX) ---
def build_synopsis_docx(docx_path, flowchart_img_path, logo_img_path):
    doc = Document()

    # Set page margins to standard 1 inch
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Styles helper
    def add_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Arial'
        run.font.size = Pt(18)
        run.font.color.rgb = RGBColor(15, 23, 42)
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        return p

    def add_meta(text, bold_prefix="", size=10.5, align=WD_ALIGN_PARAGRAPH.CENTER):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.name = 'Arial'
            r_pre.font.size = Pt(size)
            r_pre.font.color.rgb = RGBColor(30, 41, 59)
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(size)
        run.font.color.rgb = RGBColor(51, 65, 85)
        return p

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Arial'
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(15, 23, 42) # Deep Slate / Black
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Arial'
        run.font.size = Pt(11.5)
        run.font.color.rgb = RGBColor(2, 132, 199) # Ocean Cyan/Blue
        return p

    def add_body(text, space_after=6):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(space_after)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(30, 41, 59)
        return p

    def add_bullet(bold_prefix, text):
        p = doc.add_paragraph(style='List Bullet')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(4)
        if bold_prefix:
            r1 = p.add_run(bold_prefix)
            r1.bold = True
            r1.font.name = 'Times New Roman'
            r1.font.size = Pt(11)
            r1.font.color.rgb = RGBColor(15, 23, 42)
        r2 = p.add_run(text)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(11)
        r2.font.color.rgb = RGBColor(30, 41, 59)
        return p

    # --- COVER / HEADER ---
    add_title("ODYSSEY: THE AI CHALLENGE ISLANDS")
    add_meta("23103380,  23103383, 23103394", bold_prefix="Enrol No. (s) – ")
    add_meta("Samarth Agarwal, Aditya Raj, Harshvardhan Tiwari", bold_prefix="Name of Student’s Name(s) – ")
    add_meta("Dr. Sarishty Gupta", bold_prefix="Name of supervisor- ")

    # Insert JIIT Logo if exists
    if os.path.exists(logo_img_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(6)
        p_logo.paragraph_format.space_after = Pt(6)
        run_logo = p_logo.add_run()
        run_logo.add_picture(logo_img_path, width=Inches(1.8))

    add_meta("MINOR PROJECT-2\n(15B19CI691)", bold_prefix="", size=11)
    add_meta("Submitted in partial fulfilment of the Degree of Bachelor of Technology in\nComputer Science Engineering", size=10)
    add_meta("DEPARTMENT OF COMPUTER SCIENCE ENGINEERING &\nINFORMATION TECHNOLOGY\nJAYPEE INSTITUTE OF INFORMATION TECHNOLOGY, NOIDA", bold_prefix="", size=10.5)

    doc.add_page_break()

    # --- 1. INTRODUCTION ---
    add_heading_1("INTRODUCTION")
    add_body(
        "Artificial Intelligence (AI) and Machine Learning (ML) have evolved from specialized theoretical subjects into the foundational computational infrastructure of contemporary technology. From predictive credit risk modeling and computer vision to deep transformer representations, autonomous reinforcement learning agents, and retrieval-augmented generation (RAG), modern engineering disciplines demand an integrated understanding of how intelligent systems perceive, reason, and act. However, traditional academic pedagogy and technical evaluation in AI remain largely bifurcated: learners either encounter abstract mathematical formulas detached from operational systems or interact with passive chatbots and isolated coding assignments that fail to develop an intuitive, experiential grasp of decision boundaries, model uncertainty, and failure modes."
    )
    add_body(
        "At the same time, interactive digital platforms and serious games have demonstrated remarkable effectiveness in technical skill acquisition and cognitive retention. By transforming algorithmic mechanics—such as class probability distributions, feature maps, self-attention token weights, Markov Decision Process (MDP) state transitions, and vector similarity search—into tangible, feedback-driven challenges, complex computational processes become observable, diagnostic, and engaging."
    )
    add_body(
        "The proposed system, ODYSSEY — The AI Challenge Islands, is a game-driven, full-stack interactive AI evaluation and learning web application. Framed through an immersive maritime expedition where the player is a castaway stranded upon an uncharted archipelago governed by autonomous intelligence nodes, the user must travel across six specialized challenge islands: Machine Learning (The Predictor), Deep Learning (The Mirror), Computer Vision (The Observer), Natural Language Processing (The Voices), Reinforcement Learning (The Decision), and Retrieval-Augmented Generation (The Archive). Each island challenges the user to solve real perceptual, predictive, linguistic, policy, and knowledge retrieval tasks backed by live inference engines. By combining live algorithmic telemetry with narrative progression, ODYSSEY converts AI education into a participatory scientific journey toward Home Sanctuary."
    )

    # --- 2. PROBLEM STATEMENT ---
    add_heading_1("PROBLEM STATEMENT")
    add_body(
        "Understanding modern artificial intelligence requires mastering diverse and interconnected computational paradigms—ranging from classical tabular statistical inference and deep neural representation learning to spatial vision, linguistic self-attention, dynamic programming, and high-dimensional vector search. Despite widespread interest, learning and assessing competence across these varied domains faces several persistent obstacles:"
    )
    add_bullet(
        "Passive and Monolithic Educational Interfaces: ",
        "Most learning platforms rely on static multiple-choice questionnaires or disconnected code exercises that provide no real-time telemetry into model uncertainty, loss surfaces, bounding box coordinates, or Q-value matrices."
    )
    add_bullet(
        "Lack of Unified Multi-Domain Evaluation: ",
        "Existing solutions typically evaluate a single paradigm in isolation (e.g., exclusively NLP prompt engineering or basic classification on synthetic data), lacking an integrated environment that bridges classical ML, deep vision transformers, reinforcement learning MDPs, and vector retrieval."
    )
    add_bullet(
        "Absence of Dynamic Grounding and Verifiability: ",
        "In conventional testing environments, knowledge retrieval tasks are hardcoded and static, preventing users from examining how information retrieval systems operate on dynamic, user-specified, real-world data sources."
    )
    add_bullet(
        "Conceptual Gap Between Theory and Operational AI: ",
        "Learners frequently struggle to connect theoretical formulations (such as Softmax temperature scaling, Intersection over Union thresholds, Bellman optimality equations, and cosine similarity) with their empirical consequences in operational software."
    )
    add_body(
        "The problem addressed in this project is the design and implementation of an intelligent, production-ready web platform capable of contextualizing diverse, live AI models within an interactive, progressive challenge framework—enabling users to empirically explore, evaluate, and master foundational AI disciplines through verifiable real-time inference and feedback."
    )

    # --- 3. ABSTRACT ---
    add_heading_1("ABSTRACT")
    add_body(
        "ODYSSEY — The AI Challenge Islands is an intelligent, game-driven web application designed to evaluate, demonstrate, and teach foundational paradigms of Artificial Intelligence through hands-on perceptual, analytical, and decision-making challenges. The project conceptualizes an autonomous archipelago wherein each island embodies a specific domain of modern intelligent systems. Rather than serving as an abstract textbook or a conversational chatbot, ODYSSEY implements an interactive maritime expedition where the user's objective is to reach Home Sanctuary by collecting six legendary computational relics awarded upon conquering each specialized domain."
    )
    add_body(
        "The platform integrates six distinct computational modules: (1) Machine Learning (The Predictor), implementing RandomForestClassifier credit default risk assessment, GradientBoostingRegressor property valuation, and IsolationForest unsupervised transaction anomaly isolation; (2) Deep Learning (The Mirror), utilizing Vision Transformers (trpakov/vit-face-expression) to perceive facial micro-expressions and visualize calibrated Softmax logit distributions; (3) Computer Vision (The Observer), employing aerial reconnaissance drone feeds with MobileNetV3-SSD / Faster R-CNN backbones for object detection, bounding box regression, and scene parsing; (4) Natural Language Processing (The Voices), deploying a fine-tuned DistilBERT transformer self-attention model to decipher survivor radio transmissions across sentiment, emotion, intent, and sarcasm detection with inline attention token highlighting; (5) Reinforcement Learning (The Decision), implementing a turn-based survival grid-world Markov Decision Process (MDP) governed by dynamic vital constraints and real-time Bellman Value Iteration calculating action-values Q(s, a) and policy alignment; and (6) Retrieval-Augmented Generation (The Archive), featuring an end-to-end RAG pipeline that scrapes arbitrary user-submitted URLs, performs semantic sliding-window chunking, builds dense in-memory Facebook AI Similarity Search (faiss.IndexFlatIP) vector indexes, dynamically synthesizes grounded questions, and verifies user answers via cosine similarity with source chunk citations."
    )
    add_body(
        "ODYSSEY is engineered as a high-performance web application utilizing a FastAPI (Python 3.11) asynchronous backend and a React 18 / TypeScript / Tailwind CSS frontend, complete with an embedded SQLite profile database, dynamic difficulty adjustment (DDA), and a zero-dependency Web Audio API procedural sound engine. The system successfully demonstrates the feasibility of combining rigorous AI research architectures with game-first user experiences."
    )

    # --- 4. OBJECTIVES ---
    add_heading_1("OBJECTIVES")
    add_body(
        "The primary objective of the ODYSSEY system is to design, develop, and deploy an end-to-end interactive web platform that unifies diverse artificial intelligence paradigms into a progressive, challenge-driven evaluation environment backed by live computational models."
    )
    add_body("The specific objectives of the project are as follows:")
    add_bullet("To design and develop ODYSSEY: ", "An intelligent, gamified web platform featuring an interactive nautical archipelago chart, user profile management, streak multipliers, and relic collection mechanisms.")
    add_bullet("To implement Supervised & Unsupervised Machine Learning Modules: ", "Deploy Random Forest, Gradient Boosting, and Isolation Forest models on tabular features to evaluate loan default probability, real estate valuation regression, and financial transaction anomalies.")
    add_bullet("To integrate Deep Vision Transformer Models: ", "Deploy a Vision Transformer (ViT) architecture to analyze affective micro-expressions and render comparative human-versus-model Softmax probability distributions.")
    add_bullet("To implement Tactical Computer Vision & Object Localization: ", "Construct an aerial reconnaissance feed module with bounding box regression, label annotation, and confidence scoring across dynamic visual scenes.")
    add_bullet("To implement Transformer-Based Natural Language Understanding: ", "Integrate fine-tuned transformer attention heads (DistilBERT) capable of multi-class intent categorization, affective sentiment analysis, and sarcasm identification, exposing salient attention token weights.")
    add_bullet("To formulate a Grid-World Markov Decision Process (MDP): ", "Model an environmental survival game utilizing Bellman Optimality equations, evaluating user action sequences against optimal policy vectors in real time.")
    add_bullet("To develop an Arbitrary URL Ingestion & FAISS Vector RAG Engine: ", "Build an in-memory Facebook AI Similarity Search (FAISS) index pipeline capable of live web scraping, semantic chunking, automated grounded question generation, and cosine similarity evaluation with exact citation retrieval.")
    add_bullet("To incorporate Dynamic Difficulty Adjustment (DDA): ", "Formulate an adaptive difficulty engine that tracks rolling player accuracy across Easy, Medium, and Hard challenge tiers to maintain optimal engagement and learning efficacy.")

    # --- 5. FLOW CHART ---
    add_heading_1("FLOW CHART")
    add_body(
        "The structural execution and decision pipeline of the ODYSSEY system is illustrated below. The architecture connects the user interface to six live AI execution backbones, feeding evaluation metrics into the scoring, streak, and dynamic difficulty adjustment engines before committing persistent progression to the database."
    )
    if os.path.exists(flowchart_img_path):
        p_fc = doc.add_paragraph()
        p_fc.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_fc.paragraph_format.space_before = Pt(4)
        p_fc.paragraph_format.space_after = Pt(8)
        run_fc = p_fc.add_run()
        run_fc.add_picture(flowchart_img_path, width=Inches(6.5))

    # --- 6. OUR PROGRESS ---
    add_heading_1("OUR PROGRESS")
    add_body(
        "The ODYSSEY platform is fully realized as a functional, end-to-end prototype deployed across client and server architectures. All six AI domain engines, the persistent SQLite game state database, and the user interface have been developed, benchmarked, and verified:"
    )

    # Progress Table
    table = doc.add_table(rows=1, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Style Header Row
    hdr_cells = table.rows[0].cells
    headers = ["Island / Module", "Computational Model", "Key Technical Mechanics", "Operational Status"]
    col_widths = [Inches(1.5), Inches(1.7), Inches(2.3), Inches(1.0)]

    for idx, heading in enumerate(headers):
        hdr_cells[idx].text = heading
        hdr_cells[idx].width = col_widths[idx]
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="0F172A"/>')
        hdr_cells[idx]._tc.get_or_add_tcPr().append(shd)
        p = hdr_cells[idx].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.bold = True
            run.font.name = 'Arial'
            run.font.size = Pt(9)
            run.font.color.rgb = RGBColor(255, 255, 255)

    # Table Data
    table_data = [
        ("01: The Predictor", "Random Forest, Gradient Boosting, Isolation Forest", "Credit default probability, valuation regression, financial anomaly isolation", "Verified 100%"),
        ("02: The Mirror", "Vision Transformer (trpakov/vit-face-expression)", "Micro-expression perception, 6-class Softmax probability distribution", "Verified 100%"),
        ("03: The Observer", "MobileNetV3-SSD / Faster R-CNN Backbone", "Aerial drone reconnaissance feeds, bounding box regression, object counting", "Verified 100%"),
        ("04: The Voices", "DistilBERT (distilbert-base-uncased-finetuned-sst-2)", "SOS intent classification, sentiment analysis, sarcasm detection, token attention", "Verified 100%"),
        ("05: The Decision", "Markov Decision Process (MDP) & Q-Learning", "Survival grid-world, dynamic resource decay, real-time Bellman Q(s, a) table", "Verified 100%"),
        ("06: The Archive", "FAISS (IndexFlatIP) + Dense TF-IDF Embeddings", "Live URL ingestion, semantic chunking, question synthesis, citation retrieval", "Verified 100%"),
        ("07: Home Sanctuary", "Master Relic Core Assembly Engine", "6-relic assembly core, cumulative score metrics, graduation certificate", "Verified 100%")
    ]

    for row_idx, row_data in enumerate(table_data):
        row = table.add_row()
        fill_color = "F8FAFC" if row_idx % 2 == 0 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.text = val
            cell.width = col_widths[c_idx]
            shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_color}"/>')
            cell._tc.get_or_add_tcPr().append(shd)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.name = 'Times New Roman'
                run.font.size = Pt(8.5)
                run.font.color.rgb = RGBColor(30, 41, 59)
                if c_idx == 3:
                    run.bold = True
                    run.font.color.rgb = RGBColor(5, 150, 105)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    add_body(
        "Empirical Verification Highlights: (1) The RAG URL Ingestion and Indexing pipeline was validated against live Wikipedia endpoints (Deep Blue, Artificial Intelligence, Apollo 11, James Webb Space Telescope), consistently segmenting text into 100+ overlapping chunks, compiling FAISS IndexFlatIP vectors in milliseconds, and generating grounded temporal and conceptual questions. (2) Cosine similarity scoring achieves over 0.69 on exact chunk queries, outputting verifiable citations and source text excerpts. (3) The frontend client builds cleanly via tsc && vite build in 962 ms with zero TypeScript or bundling errors."
    )

    # --- 7. WEB APPLICATION ---
    add_heading_1("WEB APPLICATION")
    add_body(
        "The ODYSSEY web application serves as the interactive, unified medium connecting the user directly to the underlying artificial intelligence engines. Designed around a dark maritime-tactical aesthetic with radar scan overlays and cybernetic glow panels, the interface is structured for high responsiveness, visual clarity, and intuitive interaction across modern desktop and mobile browsers:"
    )
    add_body(
        "The website functions as a seamless portal where users navigate an uncharted archipelago via an interactive nautical chart. When a player selects an island, the application loads specialized challenge interfaces that expose model internals: tabular feature dossiers for Machine Learning, animated Softmax distribution bars for Deep Learning, neon bounding boxes with IoU confidence scores for Computer Vision, and attention-weighted token highlights for Natural Language Processing. For Reinforcement Learning, an interactive tile canvas provides tactile D-pad navigation while rendering live Bellman Q-values and tracking player policy alignment. For RAG Island, the user can paste any URL or choose from one-click presets, watching the engine chunk and index the page before presenting dynamic grounded questions and chunk citations."
    )
    add_body(
        "The application also integrates a zero-dependency Web Audio API procedural sound synthesizer (client/src/utils/audio.ts) that mathematically generates navigational clicks, ascending success arpeggios, error alerts, relic acquisition chords, and victory fanfares without requiring external sound file downloads. User progression, streak multipliers, and relic holdings are persisted asynchronously in an embedded SQLite database, ensuring persistent cross-session state."
    )

    # --- 8. SCOPE OF PROJECT ---
    add_heading_1("SCOPE OF PROJECT")
    add_body(
        "The scope of the ODYSSEY project centers on creating a holistic, multi-paradigm evaluation and learning framework for artificial intelligence that bridges theoretical formulation and practical application through gamification:"
    )
    add_body(
        "The project spans six foundational branches of artificial intelligence: classical tabular supervised learning, unsupervised anomaly detection, deep vision transformers, computer vision object detection, transformer natural language processing, reinforcement learning MDPs, and dense vector retrieval (RAG). By focusing on lightweight, inference-ready architectures (Scikit-Learn, PyTorch, MobileNetV3, DistilBERT, FAISS), the system achieves low-latency evaluation without requiring multi-GPU server clusters."
    )
    add_body(
        "The system is designed as a production-grade web prototype demonstrating the integration of multiple distinct AI disciplines within a single cohesive framework. The RAG module explores live web ingestion, semantic boundary detection, in-memory FAISS indexing, and template-free question generation, establishing a generalized model for grounded document interaction. Furthermore, the project incorporates Dynamic Difficulty Adjustment (DDA) algorithms to modulate challenge complexity in response to real-time player accuracy."
    )
    add_body(
        "While the current implementation demonstrates core perception, prediction, and decision-making capabilities across all six islands, potential future extensions include supporting browser-side model fine-tuning using WebGPU/ONNX Runtime, multi-agent reinforcement learning environments, and voice-assisted multimodal interactions."
    )

    # --- 9. UNIQUE FEATURES ---
    add_heading_1("UNIQUE FEATURES")
    add_body(
        "The ODYSSEY platform incorporates several features that distinguish it from conventional coding sandboxes, chatbots, and passive educational modules:"
    )
    add_bullet("Game-First Serious Learning Architecture: ", "Replaces passive reading and conventional questionnaires with an engaging castaway survival narrative where gameplay progression directly mirrors the acquisition of AI competencies.")
    add_bullet("Full-Spectrum Multi-Paradigm Integration: ", "Unifies Machine Learning, Deep Learning, Computer Vision, NLP, Reinforcement Learning, and RAG into a single cohesive platform rather than fragmenting them across disparate tutorials.")
    add_bullet("Arbitrary URL Ingestion & On-the-Fly Vector RAG: ", "Unlike systems with static question banks, The Archive allows users to submit any live web link, dynamically compiling a FAISS vector index, extracting semantic propositions, and evaluating user comprehension against grounded source citations.")
    add_bullet("Transparent Model Telemetry: ", "Demystifies black-box AI by exposing real-time internal representations—such as Softmax class logits, transformer self-attention highlights, bounding box localization metrics, and Bellman Q-value action matrices.")
    add_bullet("Live Policy Alignment Metrics: ", "The Reinforcement Learning island dynamically scores how closely a player's moves adhere to the Bellman optimal policy, transforming abstract dynamic programming into an intuitive puzzle.")
    add_bullet("Zero-Dependency Procedural Audio Engine: ", "Utilizes the native browser Web Audio API to synthesize custom sound effects and victory chords mathematically, ensuring instant page loading and high immersion without external audio assets.")
    add_bullet("Unified Single-Port Deployment: ", "The FastAPI server simultaneously hosts RESTful API endpoints and serves compiled, production-optimized React static assets, eliminating cross-origin complications and simplifying deployment.")

    # --- 10. TECHNICAL TOOLS USED ---
    add_heading_1("TECHNICAL TOOLS USED")
    add_body(
        "The development of ODYSSEY involves the use of modern software tools, programming frameworks, and AI libraries to implement and demonstrate the proposed challenge platform:"
    )
    add_bullet("Programming Languages: ", "Python 3.11 is used as the primary backend language for model orchestration, mathematical computations, data scraping, and API routing. TypeScript and JavaScript (ES6+) are utilized for front-end development, state management, and procedural audio synthesis. HTML5 and CSS3 provide semantic markup and styling primitives.")
    add_bullet("Deep Learning & ML Frameworks: ", "PyTorch (torch, torchvision) is utilized for neural network inference, tensor computations, and Vision Transformer operations. Scikit-Learn is deployed for Random Forest classification, Gradient Boosting regression, Isolation Forest anomaly isolation, and TF-IDF vectorization.")
    add_bullet("Transformers & NLP Models: ", "Hugging Face Transformers is used for loading pre-trained NLP transformer weights (distilbert-base-uncased-finetuned-sst-2-english) and Vision Transformers (trpakov/vit-face-expression).")
    add_bullet("Vector Search & Information Retrieval: ", "Facebook AI Similarity Search (faiss-cpu) is utilized in Island 6 for high-performance dense vector search (IndexFlatIP) and cosine similarity retrieval.")
    add_bullet("Computer Vision & Data Processing: ", "NumPy and SciPy are used for vectorized calculations, matrix manipulations, and probability distribution calibration. BeautifulSoup4 and Urllib are deployed for live web scraping and HTML sanitization.")
    add_bullet("Web Application Frameworks: ", "FastAPI provides high-throughput asynchronous REST API routing and static asset delivery. React 18, Vite, and Tailwind CSS power the modular, responsive user interface, complemented by Lucide React icons and Canvas Confetti.")
    add_bullet("Database & Persistence: ", "SQLite3 serves as the embedded relational database engine persisting player profiles, conquered islands, scores, and relic collections in odyssey.db.")

    # --- 11. EXPECTED OUTCOMES ---
    add_heading_1("EXPECTED OUTCOMES")
    add_body(
        "The completed ODYSSEY platform delivers a fully working, robust prototype that demonstrates the feasibility and educational value of game-first AI benchmarking:"
    )
    add_bullet("A Fully Playable Web Platform: ", "Users can immediately launch and play through an immersive, multi-island journey without requiring local model compilation or manual environment configuration.")
    add_bullet("Demonstrated Proficiency Across Six AI Disciplines: ", "Provides an empirical, reproducible pipeline where users solve real-world problems in tabular ML, affective vision transformers, tactical object detection, transformer NLP, grid-world RL, and vector-grounded RAG.")
    add_bullet("Dynamic Information Retrieval Demonstration: ", "Confirms that arbitrary web documents can be ingested, chunked, and queried using in-memory FAISS vector indexing and template-driven question generation in real time.")
    add_bullet("Intuitive Visualization of Model Internals: ", "Successfully renders complex internal metrics (Softmax distributions, attention token weights, bounding box IoUs, and Bellman Q-values) in an accessible, visually engaging manner.")
    add_bullet("A Foundation for Future Academic and Educational Deployment: ", "Establishes an extensible baseline for academic coursework, competitive AI hackathons, and classroom demonstrations where students' conceptual and practical knowledge can be holistically assessed.")

    # --- 12. LITERATURE REVIEW ---
    add_heading_1("LITERATURE REVIEW")

    lit_reviews = [
        {
            "title": "Attention Is All You Need (2017) [1]",
            "authors": "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I.",
            "link": "https://arxiv.org/abs/1706.03762",
            "summary": "This seminal paper introduced the Transformer architecture, which dispenses entirely with recurrence and convolutions in favor of self-attention mechanisms. The model achieves superior parallelization, drastically reduced training times, and state-of-the-art results in sequence modeling tasks, serving as the universal foundation for modern large language models and vision transformers.",
            "relevance": "ODYSSEY directly leverages transformer architectures across multiple islands: Island 4 employs DistilBERT multi-head attention to classify survivor transmissions and extract salient tokens, Island 2 utilizes Vision Transformers (ViT) for facial expression analysis, and Island 6 incorporates transformer concepts for semantic retrieval."
        },
        {
            "title": "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale (2020) [2]",
            "authors": "Dosovitskiy, A., Beyer, L., Kolesnikov, A., Weissenborn, D., Zhai, X., Unterthiner, T., Dehghani, M., Minderer, M., Heigold, G., Gelly, S., Uszkoreit, J., & Houlsby, N.",
            "link": "https://arxiv.org/abs/2010.11929",
            "summary": "This research introduced the Vision Transformer (ViT), demonstrating that standard transformer architectures applied directly to sequences of non-overlapping image patches can achieve competitive performance with state-of-the-art convolutional networks on image classification benchmarks while requiring substantially fewer computational resources for pre-training.",
            "relevance": "Island 2 (The Mirror) is built upon a fine-tuned Vision Transformer model (vit-face-expression). The platform decomposes user-evaluated micro-expressions into patch attention representations and visualizes the resulting Softmax class distribution."
        },
        {
            "title": "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (2020) [3]",
            "authors": "Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W., Rocktäschel, T., Riedel, S., & Kiela, D.",
            "link": "https://arxiv.org/abs/2005.11401",
            "summary": "This paper formulated the Retrieval-Augmented Generation (RAG) framework, combining pre-trained parametric language models with non-parametric dense vector index retrieval. The hybrid model retrieves relevant documents from an external corpus conditioned on the input query, substantially mitigating hallucinations and enabling dynamic knowledge updates without costly model retraining.",
            "relevance": "Island 6 (The Archive) directly implements the principles of RAG. The system ingests arbitrary URLs provided by the player, extracts semantic knowledge chunks, indexes them into a dense vector space, and uses grounded retrieval to evaluate player answers with exact source citations."
        },
        {
            "title": "Billion-Scale Similarity Search with GPUs (FAISS) (2019) [4]",
            "authors": "Johnson, J., Douze, M., & Jégou, H.",
            "link": "https://arxiv.org/abs/1702.08734",
            "summary": "The authors introduced Facebook AI Similarity Search (FAISS), an open-source library optimized for high-throughput, memory-efficient nearest neighbor search in high-dimensional vector spaces. FAISS introduces optimized inverted index structures and product quantization methods, allowing billions of dense vectors to be searched in milliseconds.",
            "relevance": "ODYSSEY utilizes faiss-cpu (faiss.IndexFlatIP) within the RAG island engine. Upon text chunking, dense TF-IDF vector embeddings are indexed into FAISS to enable instantaneous inner-product similarity search and relevant chunk extraction during player evaluation."
        },
        {
            "title": "Human-Level Control Through Deep Reinforcement Learning (2015) [5]",
            "authors": "Mnih, V., Kavukcuoglu, K., Silver, D., Rusu, A. A., Veness, J., Bellemare, M. G., Graves, A., Riedmiller, M., Fidjeland, A. K., Ostrovski, G., Petersen, S., Beattie, C., Sadik, A., Antonoglou, I., King, H., Kumaran, D., Wierstra, D., Legg, S., & Hassabis, D.",
            "link": "https://www.nature.com/articles/nature14236",
            "summary": "This groundbreaking work from Google DeepMind introduced Deep Q-Networks (DQN), bridging reinforcement learning with deep artificial neural networks to master complex Atari 2600 games directly from raw visual pixels, achieving performance comparable to expert human players using experience replay and target networks.",
            "relevance": "Island 5 (The Decision) is grounded in the foundational principles of Markov Decision Processes and Q-learning established by Bellman and expanded in this work. The game computes exact state-action values Q(s, a) and tracks the user's real-time policy alignment against the optimal Bellman policy vector."
        },
        {
            "title": "DistilBERT, a Distilled Version of BERT: Smaller, Faster, Cheaper and Lighter (2019) [6]",
            "authors": "Sanh, V., Debut, L., Chaumond, J., & Wolf, T.",
            "link": "https://arxiv.org/abs/1910.01108",
            "summary": "This work presented DistilBERT, a knowledge distillation technique that reduces the parameter size of BERT by 40% while retaining 97% of its language understanding capabilities and executing 60% faster during inference. The distilled model provides a lightweight, computationally practical solution for low-latency web applications.",
            "relevance": "Island 4 (The Voices) deploys a distilled transformer architecture (distilbert-base-uncased-finetuned-sst-2-english) to analyze survivor logs in milliseconds, extracting sentiment polarities, emotional intent, and token-level attention saliency without overloading server resources."
        }
    ]

    for item in lit_reviews:
        add_heading_2(item["title"])
        add_bullet("Authors: ", item["authors"])
        add_bullet("Link: ", item["link"])
        add_bullet("Summary: ", item["summary"])
        add_bullet("Relevance to Project: ", item["relevance"])

    # Save document
    doc.save(docx_path)
    print(f"Document successfully created and saved at: {docx_path}")

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    flowchart_path = os.path.join(script_dir, "odyssey_flowchart.png")
    logo_path = r"C:\Users\TVM2\OneDrive\Documents\minor2\jiit.jpeg"
    
    primary_docx = os.path.join(script_dir, "ODYSSEY_Project_Synopsis.docx")
    secondary_docx = r"C:\Users\TVM2\OneDrive\Documents\ODYSSEY_Project_Synopsis.docx"
    
    generate_flowchart(flowchart_path)
    build_synopsis_docx(primary_docx, flowchart_path, logo_path)
    
    # Also copy / build to user's root Documents folder for convenience
    import shutil
    shutil.copyfile(primary_docx, secondary_docx)
    print(f"Convenience copy saved to: {secondary_docx}")

