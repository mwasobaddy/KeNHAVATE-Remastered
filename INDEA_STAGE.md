



Stage 1 — Submission
SUBMITTED - Idea submitted; awaiting DD action to open it for review, triggered by Author during submission


Stage 2 — SME review
OPEN_FOR_SME_REVIEW - DD has unlocked the idea whose status is SUBMITTED; SME comment period is active, triggered by DD
SME_REVIEW_IN_PROGRESS - One or more SMEs have submitted comments, triggered by submitting a comment SME / System when first comment is submitted
PENDING_DD_COMPILATION - Review deadline expired; DD is compiling all SME comments into one response, triggered by the System when the last comment is received / when the deadline passes. Stores a stage field (SME | BOARD) to record where the decision revision was made

NB: After compilation, DD dispatches feedback and transitions idea directly to PENDING_BOARD_REVIEW (positive), REVISION_REQUIRED (needs corrections), or REJECTED (does not meet standards).


Stage 3 — Revision loop
REVISION_REQUIRED - Idea is missing information or needs correction before it qualifies, triggered when DD complies and comments on the idea after SME review
UNDER_REVISION - Author is actively working on corrections, triggered by the Author / System when the Author starts making changes after receiving revision feedback.
REVISION_SUBMITTED -  Corrected idea resubmitted; DD will assign one SME for targeted verification, triggered by the Author resubmitting the idea after revision.


Stage 4 — Delegated review
DELEGATED_SME_REVIEW - DD has assigned one SME to verify that corrections were applied, triggered by DD
PENDING_DD_DECISION - Delegated SME has reviewed; awaiting DD's final call, triggered by the Delegated SME

NB: DD decision branches to PENDING_BOARD_REVIEW (approved), REVISION_REQUIRED (loop continues), or REJECTED. The loop repeats until a final state is reached.


Stage 5 — Board review
PENDING_BOARD_REVIEW - SME stage cleared by DD; idea awaiting board scheduling, triggered by DD
BOARD_REVIEW_IN_PROGRESS - Board members are actively reviewing the idea, triggered by Board submitting their reviews
DD_COMPILATION - Review deadline expired; DD is compiling all Board comments into one response, triggered by the System. Stores a stage field (SME | BOARD) to record where the decision revision was made
BOARD_REVISION_REQUIRED - Board requests corrections or additional information from author, triggerd by the DD
UNDER_BOARD_REVISION - Author is addressing board-requested corrections, triggered by the Author
BOARD_REVISION_SUBMITTED - Author resubmitted after board feedback; awaiting board re-review, triggered by the Author resubmitting the idea after board revision.

NB: Board decision loops through revision until final state: BOARD_APPROVED or REJECTED.


Terminal — Rejection
REJECTED - Final rejection — idea does not meet required standards. Stores a stage field (SME_REVIEW | DELEGATED | BOARD) to record where the decision was made. DD / Board


Terminal — Approval
BOARD_APPROVED - Board has approved the idea; unlocks the implementation stage, triggered by the DD after compiling board feedback and making the final call on approval. Stores a stage field (BOARD) to record where the decision was made. DD / Board
IMPLEMENTATION_IN_PROGRESS - Approved idea is being implemented triggered by the DD / System.
CLOSED - Implementation complete; idea record archived, trigered by DD.


run the command "php artisan migrate:fresh --seed" and fix the errors. But confirm if anything is ambigous