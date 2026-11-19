import { ViewType } from '../types';

export interface ZoneMetadata {
  zoneKey: string;
  title: string;
  shortTitle: string;
  islandKey: string;
  islandTitle: string;
  islandView: ViewType;
  coreConcept: string;
  misconceptionTested: string;
  remediationCue: string;
  relatedSkills: string[];
}

export interface IslandMetadata {
  islandKey: string;
  canonicalKey: string;
  num: number;
  title: string;
  domain: string;
  relicName: string;
  viewKey: ViewType;
  accentColor: string; // Tailwind color name
  hexColor: string;
  zones: string[];
}

export const ZONE_METADATA_REGISTRY: Record<string, ZoneMetadata> = {
  // --- Island 1: Machine Learning ---
  shoreline: {
    zoneKey: 'shoreline',
    title: 'Supervised vs. Unsupervised Learning',
    shortTitle: 'Supervised vs. Unsupervised',
    islandKey: 'machine_learning',
    islandTitle: 'The Predictor',
    islandView: 'ml',
    coreConcept: 'Ground-truth paired labels (X, Y) classification vs. unguided centroid cluster discovery.',
    misconceptionTested: 'Conflating unsupervised pattern clustering (e.g., customer segmentation) with supervised regression or classification.',
    remediationCue: 'Verify whether your training data contains explicit ground-truth target labels (Y) before selecting classification vs. clustering.',
    relatedSkills: ['Data Labeling', 'K-Means Clustering', 'Problem Formulation']
  },
  ridge: {
    zoneKey: 'ridge',
    title: 'Linear Regression & Loss/MSE Optimization',
    shortTitle: 'Linear Regression & MSE',
    islandKey: 'machine_learning',
    islandTitle: 'The Predictor',
    islandView: 'ml',
    coreConcept: 'Residual sum of squares minimization and balancing slope weights against baseline intercept bias.',
    misconceptionTested: 'Treating the slope as the sole predictor while neglecting how intercept bias shifts the baseline hyperplane.',
    remediationCue: 'Practice residual minimization: slope regulates the trajectory angle, while intercept calibrates the baseline offset.',
    relatedSkills: ['Loss Functions', 'Gradient Descent', 'Residual Analysis']
  },
  swamp: {
    zoneKey: 'swamp',
    title: 'Overfitting vs. Underfitting Loss Dynamics',
    shortTitle: 'Overfitting & Regularization',
    islandKey: 'machine_learning',
    islandTitle: 'The Predictor',
    islandView: 'ml',
    coreConcept: 'Generalization gap, polynomial capacity scaling, and cross-validation loss divergence.',
    misconceptionTested: 'Assuming that driving training loss to near zero guarantees high performance on unseen test distributions.',
    remediationCue: 'Constrain hypothesis capacity: apply L1/L2 weight penalties, early stopping, or data augmentation when validation loss diverges.',
    relatedSkills: ['Bias-Variance Tradeoff', 'Regularization', 'Cross-Validation']
  },
  lighthouse: {
    zoneKey: 'lighthouse',
    title: 'Boss Diagnostic Trial (Metrics & Confusion Matrix)',
    shortTitle: 'Evaluation Metrics & Recall',
    islandKey: 'machine_learning',
    islandTitle: 'The Predictor',
    islandView: 'ml',
    coreConcept: 'Precision vs. Recall tradeoffs, class imbalance skew, and F1 optimization in high-stakes domains.',
    misconceptionTested: 'Relying on raw accuracy in severely imbalanced distributions where minority false negatives carry critical penalty.',
    remediationCue: 'In safety-critical navigation where missing a hazard is catastrophic, always maximize Recall (TP / [TP + FN]).',
    relatedSkills: ['Confusion Matrix', 'PR Curves', 'Metric Selection']
  },

  // --- Island 2: Deep Learning ---
  perceptron_bay: {
    zoneKey: 'perceptron_bay',
    title: 'Artificial Neurons & Non-Linear Activation Functions',
    shortTitle: 'Neurons & Activations',
    islandKey: 'deep_learning',
    islandTitle: 'The Mirror',
    islandView: 'dl',
    coreConcept: 'Synaptic weighted summations, threshold bias shifting, and non-linear activation response curves.',
    misconceptionTested: 'Assuming linear activations can model non-convex multi-input decision boundaries like majority consensus.',
    remediationCue: 'Step functions have zero gradients almost everywhere; Sigmoid saturates; use ReLU or LeakyReLU for stable gradient backpropagation.',
    relatedSkills: ['Perceptron', 'Non-linear Mappings', 'Activation Derivatives']
  },
  conv_canyon: {
    zoneKey: 'conv_canyon',
    title: 'CNN Kernels & Spatial Feature Map Convolutions',
    shortTitle: 'CNN Kernels & Convolutions',
    islandKey: 'deep_learning',
    islandTitle: 'The Mirror',
    islandView: 'dl',
    coreConcept: 'Spatial sliding dot products, receptive fields, and edge-detecting differential operator kernels.',
    misconceptionTested: 'Treating convolution as a global dense matrix multiplication rather than localized translation-equivariant filtering.',
    remediationCue: 'Convolutions act as spatial differential operators: Sobel-X computes horizontal pixel derivatives, Sobel-Y vertical.',
    relatedSkills: ['Spatial Filtering', 'Feature Hierarchies', 'Receptive Fields']
  },
  vision_observatory: {
    zoneKey: 'vision_observatory',
    title: 'Object Detection & Confidence Calibration (YOLOS-Tiny)',
    shortTitle: 'Detection Threshold Tuning',
    islandKey: 'deep_learning',
    islandTitle: 'The Mirror',
    islandView: 'dl',
    coreConcept: 'Bounding box regression, Vision Transformer patch attention, and confidence threshold trade-offs.',
    misconceptionTested: 'Setting confidence thresholds too high (missing valid targets) or too low (flooding predictions with false positives).',
    remediationCue: 'Calibrate confidence thresholds empirically: lower thresholds maximize recall; higher thresholds enforce high precision.',
    relatedSkills: ['Object Detection', 'Confidence Calibration', 'Vision Transformers']
  },
  neural_citadel: {
    zoneKey: 'neural_citadel',
    title: 'Boss Diagnostic Trial (Vanishing Gradients & Skip Connections)',
    shortTitle: 'Deep ResNet Architectures',
    islandKey: 'deep_learning',
    islandTitle: 'The Mirror',
    islandView: 'dl',
    coreConcept: 'Chain rule gradient attenuation in deep networks and residual identity shortcuts y = F(x) + x.',
    misconceptionTested: 'Attempting to solve vanishing gradients by naively adding more fully-connected dense layers.',
    remediationCue: 'Overcome vanishing gradients in deep architectures using residual skip connections and batch/layer normalization.',
    relatedSkills: ['Backpropagation', 'Residual Networks', 'Gradient Stability']
  },

  // --- Island 3: Computer Vision ---
  pixel_harbor: {
    zoneKey: 'pixel_harbor',
    title: 'Image Tensors, RGB Channels & Augmentation Pipelines',
    shortTitle: 'Tensors & Augmentation',
    islandKey: 'computer_vision',
    islandTitle: 'The Observer',
    islandView: 'cv',
    coreConcept: '3D spatial-channel tensors [H, W, C], photometric transforms, and invariance data augmentation.',
    misconceptionTested: 'Applying orientation augmentations (e.g., horizontal flips) without verifying if symmetry preserves semantic meaning.',
    remediationCue: 'Align augmentation pipelines with real-world sensor conditions: brightness jitter and noise for night/fog navigation.',
    relatedSkills: ['Image Tensors', 'Data Augmentation', 'Distribution Shift']
  },
  segmentation_reef: {
    zoneKey: 'segmentation_reef',
    title: 'Semantic Segmentation (SegFormer-B0) & mIoU Evaluation',
    shortTitle: 'Semantic Segmentation & IoU',
    islandKey: 'computer_vision',
    islandTitle: 'The Observer',
    islandView: 'cv',
    coreConcept: 'Pixel-level categorical masks vs. coarse bounding boxes, and Mean Intersection-over-Union.',
    misconceptionTested: 'Using pixel accuracy to benchmark segmentation masks where 95% of pixels belong to the background sky or ocean.',
    remediationCue: 'Optimize Mean IoU (TP / [TP + FP + FN]) instead of pixel accuracy to heavily penalize overlooked minority foreground objects.',
    relatedSkills: ['Semantic Segmentation', 'mIoU Metric', 'Pixel Masks']
  },
  clip_lighthouse: {
    zoneKey: 'clip_lighthouse',
    title: 'Zero-Shot Vision-Language Alignment (CLIP-ViT)',
    shortTitle: 'CLIP Multimodal Embeddings',
    islandKey: 'computer_vision',
    islandTitle: 'The Observer',
    islandView: 'cv',
    coreConcept: 'Joint multi-modal embedding spaces, contrastive image-text pre-training, and cosine softmax logits.',
    misconceptionTested: 'Providing single isolated keywords to CLIP rather than natural language context prompts like "a photo of a...".',
    remediationCue: 'CLIP text encoders are pre-trained on full descriptive web captions; prompt engineering with descriptive context boosts zero-shot accuracy.',
    relatedSkills: ['Multimodal AI', 'Contrastive Learning', 'Zero-Shot Classification']
  },
  vision_citadel: {
    zoneKey: 'vision_citadel',
    title: 'Boss Diagnostic Trial (CV Paradigms & Domain Adaptation)',
    shortTitle: 'CV Paradigms & Domain Shift',
    islandKey: 'computer_vision',
    islandTitle: 'The Observer',
    islandView: 'cv',
    coreConcept: 'Selecting between detection, semantic, and instance segmentation, and countering environmental covariate shift.',
    misconceptionTested: 'Relying exclusively on bounding boxes for continuous amorphous terrain boundaries like reefs and navigable channels.',
    remediationCue: 'Autonomous navigation requires Semantic/Instance Segmentation to delineate exact drivable road boundaries beyond rectangular bounding boxes.',
    relatedSkills: ['Computer Vision Systems', 'Domain Adaptation', 'Geometric Metrics']
  },

  // --- Island 4: Natural Language Processing ---
  token_port: {
    zoneKey: 'token_port',
    title: 'Subword Tokenization (BPE/WordPiece) & Vocabulary Limits',
    shortTitle: 'Subword Tokenization',
    islandKey: 'nlp',
    islandTitle: 'The Voices',
    islandView: 'nlp',
    coreConcept: 'Subword compression algorithms, frequency vocabulary merges, and token vs. character mismatch.',
    misconceptionTested: 'Assuming modern language models inspect text character-by-character rather than through integer token IDs.',
    remediationCue: 'LLMs process token vectors rather than characters; unusual compound words or large numbers split into multiple subwords.',
    relatedSkills: ['Tokenization', 'Vocabulary Management', 'Context Windows']
  },
  embedding_lagoon: {
    zoneKey: 'embedding_lagoon',
    title: 'Dense Vector Embeddings & Cosine Similarity (MiniLM-L6)',
    shortTitle: 'Dense Vector Embeddings',
    islandKey: 'nlp',
    islandTitle: 'The Voices',
    islandView: 'nlp',
    coreConcept: 'Continuous semantic vector geometry, 384-dimensional hyperspheres, and angular cosine metrics.',
    misconceptionTested: 'Expecting semantic equivalence to require lexical word overlap (Jaccard) rather than directional alignment in embedding space.',
    remediationCue: 'Dense embeddings map semantics into continuous geometric angles (Cosine Similarity); paraphrases can share zero lexical keywords while achieving >0.70 similarity.',
    relatedSkills: ['Vector Embeddings', 'Cosine Similarity', 'Semantic Search']
  },
  sentiment_gorge: {
    zoneKey: 'sentiment_gorge',
    title: 'Self-Attention & Adversarial Sarcasm (DistilBERT)',
    shortTitle: 'Self-Attention & Sarcasm',
    islandKey: 'nlp',
    islandTitle: 'The Voices',
    islandView: 'nlp',
    coreConcept: 'Dynamic query-key attention routing, contextual polarity inversion, and lexical sarcasm vulnerabilities.',
    misconceptionTested: 'Relying on superficial positive sentiment words without considering global contextual qualification.',
    remediationCue: 'Self-attention calculates dynamic token-to-token contextual affinity; superficial positive lexicons can easily fool standard sentiment classifiers on sarcastic reviews.',
    relatedSkills: ['Self-Attention', 'Sentiment Analysis', 'Adversarial Robustness']
  },
  transformer_citadel: {
    zoneKey: 'transformer_citadel',
    title: 'Boss Diagnostic Trial (Attention, Retrieval & Hallucination)',
    shortTitle: 'Transformer Architecture & RAG',
    islandKey: 'nlp',
    islandTitle: 'The Voices',
    islandView: 'nlp',
    coreConcept: 'Parallel multi-head attention, Bi-Encoder vector retrieval, and context window truncation dynamics.',
    misconceptionTested: 'Attributing conversational agent hallucination to weight decay rather than silent context window truncation.',
    remediationCue: 'Pair bi-encoders for fast approximate nearest-neighbor candidate retrieval with cross-encoder rerankers for high-precision attention ranking.',
    relatedSkills: ['Transformers', 'RAG Pipelines', 'Context Window Dynamics']
  },

  // --- Island 5: Reinforcement Learning ---
  bandit_cove: {
    zoneKey: 'bandit_cove',
    title: 'Multi-Armed Bandits & Exploration vs. Exploitation',
    shortTitle: 'Multi-Armed Bandits & ε-Greedy',
    islandKey: 'reinforcement_learning',
    islandTitle: 'The Decision',
    islandView: 'rl',
    coreConcept: 'Exploration vs. exploitation dilemma, ε-greedy policy selection, and cumulative regret minimization.',
    misconceptionTested: 'Exploiting greedy choices too early (ε=0) or exploring uniformly forever without decaying exploration over time.',
    remediationCue: 'Balance exploration and exploitation: ε = 0 locks onto suboptimal arms, while high ε fails to capitalize on the best reward distribution.',
    relatedSkills: ['Bandit Algorithms', 'Regret Minimization', 'Action-Value Estimation']
  },
  q_value_maze: {
    zoneKey: 'q_value_maze',
    title: 'GridWorld MDP, Discount Factor γ & Bellman Updates',
    shortTitle: 'GridWorld MDP & Bellman',
    islandKey: 'reinforcement_learning',
    islandTitle: 'The Decision',
    islandView: 'rl',
    coreConcept: 'Markov Decision Processes, transition rewards, temporal difference errors, and discount factor horizon regulation.',
    misconceptionTested: 'Using a very low discount factor (γ < 0.3) in delayed-reward environments, leading to myopic fatal traps.',
    remediationCue: 'Discount factor γ regulates horizon: low γ causes myopic immediate gratification, while high γ (~0.99) propagates future goals across distant states.',
    relatedSkills: ['MDP Modeling', 'Bellman Equation', 'Temporal Difference Learning']
  },
  cartpole_arena: {
    zoneKey: 'cartpole_arena',
    title: 'Deep RL Neural Policy & Policy Gradient (TensorFlow.js)',
    shortTitle: 'Deep RL Neural Policy',
    islandKey: 'reinforcement_learning',
    islandTitle: 'The Decision',
    islandView: 'rl',
    coreConcept: 'Continuous state observation vectors, neural policy parameterization, and policy gradient (REINFORCE) updates.',
    misconceptionTested: 'Attempting tabular Q-learning across continuous floating-point state variables without function approximation.',
    remediationCue: 'Continuous state spaces require function approximation (neural networks); reward shaping prevents the cart from drifting into boundary failure zones.',
    relatedSkills: ['Deep RL', 'Policy Gradients', 'Continuous Control']
  },
  policy_citadel: {
    zoneKey: 'policy_citadel',
    title: 'Boss Diagnostic Trial (Reward Hacking & Continuous Control)',
    shortTitle: 'Reward Engineering & Policy PPO',
    islandKey: 'reinforcement_learning',
    islandTitle: 'The Decision',
    islandView: 'rl',
    coreConcept: 'Specification gaming (reward hacking), potential-based reward shaping, and discrete DQN vs. continuous Actor-Critic.',
    misconceptionTested: 'Attempting to apply discrete argmax DQN to high-dimensional continuous torque actuation joints.',
    remediationCue: 'Guard against reward hacking by aligning objective metrics with desired behavior; use policy gradient/PPO for continuous actions and DQN for discrete spaces.',
    relatedSkills: ['Reward Engineering', 'Actor-Critic / PPO', 'Bellman Optimality']
  },

  // --- Optional Island 6: RAG (Extensible for when RAG is active) ---
  url_chunking: {
    zoneKey: 'url_chunking',
    title: 'Web Document Scraping & Semantic Chunking',
    shortTitle: 'Document Ingestion & Chunking',
    islandKey: 'island_6',
    islandTitle: 'The Archive',
    islandView: 'rag',
    coreConcept: 'DOM text normalization, recursive character chunking with sliding overlaps, and header preservation.',
    misconceptionTested: 'Splitting documents on arbitrary character count boundaries without maintaining semantic sentence context.',
    remediationCue: 'Use recursive boundary chunking (paragraphs → sentences → words) with 10-15% chunk overlap to preserve context.',
    relatedSkills: ['Data Ingestion', 'Semantic Chunking', 'Token Budgeting']
  },
  faiss_grounding: {
    zoneKey: 'faiss_grounding',
    title: 'Vector Indexing (FAISS) & Grounded Source Citations',
    shortTitle: 'FAISS Search & Citations',
    islandKey: 'island_6',
    islandTitle: 'The Archive',
    islandView: 'rag',
    coreConcept: 'Exact L2 / Cosine ANN vector indexing, source chunk citations, and mitigating hallucination.',
    misconceptionTested: 'Allowing the generation model to extrapolate beyond retrieved evidence without explicit source grounding.',
    remediationCue: 'Strictly constrain response synthesis to retrieved chunk context and demand verbatim chunk ID citations.',
    relatedSkills: ['Vector Databases', 'FAISS Indexing', 'Hallucination Mitigation']
  }
};

export const ISLAND_METADATA_REGISTRY: Record<string, IslandMetadata> = {
  machine_learning: {
    islandKey: 'machine_learning',
    canonicalKey: 'machine_learning',
    num: 1,
    title: 'The Predictor',
    domain: 'Machine Learning',
    relicName: 'The Matrix of Foresight',
    viewKey: 'ml',
    accentColor: 'cyan',
    hexColor: '#06b6d4',
    zones: ['shoreline', 'ridge', 'swamp', 'lighthouse']
  },
  deep_learning: {
    islandKey: 'deep_learning',
    canonicalKey: 'deep_learning',
    num: 2,
    title: 'The Mirror',
    domain: 'Deep Learning',
    relicName: 'The Prismatic Mirror',
    viewKey: 'dl',
    accentColor: 'purple',
    hexColor: '#a855f7',
    zones: ['perceptron_bay', 'conv_canyon', 'vision_observatory', 'neural_citadel']
  },
  computer_vision: {
    islandKey: 'computer_vision',
    canonicalKey: 'computer_vision',
    num: 3,
    title: 'The Observer',
    domain: 'Computer Vision',
    relicName: 'The Lens of Perception',
    viewKey: 'cv',
    accentColor: 'amber',
    hexColor: '#f59e0b',
    zones: ['pixel_harbor', 'segmentation_reef', 'clip_lighthouse', 'vision_citadel']
  },
  nlp: {
    islandKey: 'nlp',
    canonicalKey: 'nlp',
    num: 4,
    title: 'The Voices',
    domain: 'Natural Language Processing',
    relicName: 'The Echo Stone',
    viewKey: 'nlp',
    accentColor: 'emerald',
    hexColor: '#10b981',
    zones: ['token_port', 'embedding_lagoon', 'sentiment_gorge', 'transformer_citadel']
  },
  reinforcement_learning: {
    islandKey: 'reinforcement_learning',
    canonicalKey: 'reinforcement_learning',
    num: 5,
    title: 'The Decision',
    domain: 'Reinforcement Learning',
    relicName: 'The Compass of Optimality',
    viewKey: 'rl',
    accentColor: 'rose',
    hexColor: '#f43f5e',
    zones: ['bandit_cove', 'q_value_maze', 'cartpole_arena', 'policy_citadel']
  },
  island_6: {
    islandKey: 'island_6',
    canonicalKey: 'island_6',
    num: 6,
    title: 'The Archive',
    domain: 'Retrieval-Augmented Gen',
    relicName: 'The Codex of Retrieval',
    viewKey: 'rag',
    accentColor: 'indigo',
    hexColor: '#6366f1',
    zones: ['url_chunking', 'faiss_grounding']
  }
};
