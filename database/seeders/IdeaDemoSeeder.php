<?php

namespace Database\Seeders;

use App\Models\ChangeRequest;
use App\Models\CollaborationRequest;
use App\Models\Idea;
use App\Models\IdeaCategory;
use App\Models\IdeaClassification;
use App\Models\Point;
use App\Models\User;
use App\Services\Ideas\AssignmentService;
use App\Services\Ideas\ClassificationService;
use App\Services\Ideas\Decisions\DecisionService;
use App\Services\Points\PointAwardService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class IdeaDemoSeeder extends Seeder
{
    private User $admin;

    private User $officer;

    private User $dg;

    private User $peter;

    private User $grace;

    private User $samuel;

    private User $faith;

    private ?Point $ideaSubmissionPoint = null;

    private array $categories = [];

    private array $classifications = [];

    public function run(): void
    {
        if (Idea::count() > 0) {
            return;
        }

        setPermissionsTeamId(null);

        $this->createUsers();
        $this->loadReferenceData();
        $this->createIdeas();
    }

    private function createUsers(): void
    {
        $this->admin = User::firstOrCreate(
            ['email' => 'kelvinramsiel@gmail.com'],
            $this->userDefaults(['name' => 'Kelvin Ramsiel']),
        );

        $this->officer = User::firstOrCreate(
            ['email' => 'jane.muthoni@kenha.co.ke'],
            $this->userDefaults(['name' => 'Jane Muthoni', 'mobile_number' => '+254711111111']),
        );
        $this->officer->assignRole('user');
        $this->officer->givePermissionTo([
            'idea.assign_officer',
            'idea.classify',
            'idea.review',
            'idea.receive_new_submission_notifications',
            'idea.view',
            'points.view',
        ]);

        $this->dg = User::firstOrCreate(
            ['email' => 'david.kamau@kenha.co.ke'],
            $this->userDefaults(['name' => 'David Kamau', 'mobile_number' => '+254722222222']),
        );
        $this->dg->assignRole('user');
        $this->dg->givePermissionTo([
            'idea.record_decision',
            'idea.review',
            'idea.view',
            'points.view',
        ]);

        $this->peter = User::firstOrCreate(
            ['email' => 'peter.ochieng@kenha.co.ke'],
            $this->userDefaults(['name' => 'Peter Ochieng', 'mobile_number' => '+254733333333']),
        );
        $this->peter->assignRole('user');

        $this->grace = User::firstOrCreate(
            ['email' => 'grace.wanjiku@kenha.co.ke'],
            $this->userDefaults(['name' => 'Grace Wanjiku', 'mobile_number' => '+254744444444']),
        );
        $this->grace->assignRole('user');

        $this->samuel = User::firstOrCreate(
            ['email' => 'samuel.kiprop@kenha.co.ke'],
            $this->userDefaults(['name' => 'Samuel Kiprop', 'mobile_number' => '+254755555555']),
        );
        $this->samuel->assignRole('user');

        $this->faith = User::firstOrCreate(
            ['email' => 'faith.nyambura@kenha.co.ke'],
            $this->userDefaults(['name' => 'Faith Nyambura', 'mobile_number' => '+254766666666']),
        );
        $this->faith->assignRole('user');
    }

    private function userDefaults(array $overrides): array
    {
        return array_merge([
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'terms_accepted' => true,
            'onboarding_completed_at' => now(),
        ], $overrides);
    }

    private function loadReferenceData(): void
    {
        $this->categories = IdeaCategory::pluck('id', 'slug')->all();
        $this->classifications = IdeaClassification::pluck('id', 'slug')->all();
        $this->ideaSubmissionPoint = Point::where('name', 'Idea Submission')->first();
    }

    private function createIdeas(): void
    {
        $assignmentService = app(AssignmentService::class);
        $classificationService = app(ClassificationService::class);
        $decisionService = app(DecisionService::class);
        $pointAwardService = app(PointAwardService::class);

        $innovation = IdeaClassification::find($this->classifications['innovation']);
        $research = IdeaClassification::find($this->classifications['research']);
        $project = IdeaClassification::find($this->classifications['project']);
        $outsideMandate = IdeaClassification::find($this->classifications['outside_mandate']);

        /* ──────────────────────────────────────────────
           Idea 1 — Smart Traffic Management System
           Full lifecycle: Innovation → Approved → Closed
           ────────────────────────────────────────────── */
        $idea = $this->createIdea(
            title: 'Smart Traffic Management System',
            slug: 'smart-traffic-mgmt',
            description: 'An AI-powered traffic management system using real-time data from sensors and cameras to optimize traffic flow on major highways.',
            problem: 'Traffic congestion during peak hours on major highways leads to increased travel time and fuel consumption.',
            solution: 'Deploy IoT sensors and AI-powered traffic control systems at major intersections and highway entry points to dynamically adjust traffic light timing and provide real-time traffic advisories.',
            costBenefit: 'Initial deployment cost of KES 50M vs projected annual savings of KES 200M in reduced fuel consumption and travel time.',
            categorySlug: 'road-construction-technologies',
            author: $this->peter,
        );
        $this->awardPoints($pointAwardService, $this->peter);

        $assignmentService->assign($idea, $this->officer, $this->admin);
        $classificationService->classify($idea, $this->officer, $innovation, [
            'notes' => 'Innovation idea within KeNHA mandate for road infrastructure technology.',
        ]);
        $decisionService->decide($idea, $this->dg, 'approved', 'Approved for implementation. Excellent solution with clear ROI.');
        $decisionService->progress($idea, $this->dg, 'Phase 1: sensor deployment on Thika Road.');
        $decisionService->progress($idea, $this->dg, 'All sensors installed and AI system operational. Pilot completed.');
        $decisionService->progress($idea, $this->dg, 'System fully integrated with KeNHA traffic management center.');
        $decisionService->progress($idea, $this->dg, 'Project closed after successful implementation and handover.');

        /* ──────────────────────────────────────────────────
           Idea 2 — Recycled Plastic Road Binders
           Research → Budget Logged → Closed
           ────────────────────────────────────────────────── */
        $idea2 = $this->createIdea(
            title: 'Recycled Plastic Road Binders',
            slug: 'recycled-plastic-binders',
            description: 'Research into using recycled plastic waste as a partial replacement for bitumen in road construction.',
            problem: 'Plastic waste management crisis and high cost of bitumen for road construction.',
            solution: 'Process recycled plastic waste into a binder additive that can replace up to 15 % of bitumen content in asphalt mixes.',
            costBenefit: 'Research cost of KES 5M vs potential 10 % reduction in road construction costs and environmental benefits.',
            categorySlug: 'road-construction-materials',
            author: $this->grace,
        );
        $this->awardPoints($pointAwardService, $this->grace);

        $assignmentService->assign($idea2, $this->officer, $this->admin);
        $classificationService->classify($idea2, $this->officer, $research, [
            'notes' => 'Research idea requiring laboratory testing and field trials.',
        ]);
        $decisionService->decide($idea2, $this->dg, 'budget_logged', 'Research proposal approved. Budget allocated for laboratory testing.');

        /* ──────────────────────────────────────────────────
           Idea 3 — Solar-Powered Highway Lighting
           Innovation → Approved → In Progress
           ────────────────────────────────────────────────── */
        $idea3 = $this->createIdea(
            title: 'Solar-Powered Highway Lighting with IoT',
            slug: 'solar-highway-lighting',
            description: 'Solar-powered LED lighting system with IoT-based monitoring and dimming control for highway illumination.',
            problem: 'High electricity costs for highway lighting and frequent power outages affecting road safety at night.',
            solution: 'Install solar panels with battery storage at highway sections, connected through IoT controllers that adjust lighting based on traffic presence.',
            costBenefit: 'Installation cost of KES 30M per 10km section with 60 % reduction in electricity costs and zero grid dependency.',
            categorySlug: 'road-construction-technologies',
            author: $this->peter,
        );
        $this->awardPoints($pointAwardService, $this->peter);

        $assignmentService->assign($idea3, $this->officer, $this->admin);
        $classificationService->classify($idea3, $this->officer, $innovation, [
            'notes' => 'Innovation in sustainable road infrastructure.',
        ]);
        $decisionService->decide($idea3, $this->dg, 'approved', 'Approved. Implement on pilot basis on Nairobi-Nakuru highway section.');
        $decisionService->progress($idea3, $this->dg, 'Pilot installation underway on 5km section of Nairobi-Nakuru highway.');

        /* ──────────────────────────────────────────────────
           Idea 4 — AI-Based Pavement Defect Detection
           Revision loop: Classified → Revision Requested → Resubmitted
           ────────────────────────────────────────────────── */
        $idea4 = $this->createIdea(
            title: 'AI-Based Pavement Defect Detection',
            slug: 'ai-pavement-defect',
            description: 'Mobile app using smartphone cameras and machine learning to detect and classify pavement defects automatically.',
            problem: 'Manual road inspection is slow, subjective, and resource-intensive, leading to delayed maintenance.',
            solution: 'Develop a mobile application that uses the phone camera and ML models to identify cracks, potholes, and surface degradation in real-time.',
            costBenefit: 'Development cost of KES 8M vs 70 % reduction in inspection time and improved defect detection accuracy.',
            categorySlug: 'road-construction-technologies',
            author: $this->grace,
        );
        $this->awardPoints($pointAwardService, $this->grace);

        $assignmentService->assign($idea4, $this->officer, $this->admin);
        $classificationService->classify($idea4, $this->officer, $innovation, [
            'notes' => 'Innovation in road maintenance technology.',
        ]);
        $decisionService->requestRevision($idea4, $this->officer, 'Please provide more details on the ML model accuracy metrics and training data requirements.');
        $decisionService->resubmit($idea4, $this->grace, 'Added detailed accuracy benchmarks and data requirements section.');

        /* ──────────────────────────────────────────────────
           Idea 5 — Toll Collection Optimization
           Submitted, pending assignment
           ────────────────────────────────────────────────── */
        $idea5 = $this->createIdea(
            title: 'Toll Collection Optimization',
            slug: 'toll-optimization',
            description: 'Implementation of cashless multi-lane free-flow toll collection using RFID and ANPR technology.',
            problem: 'Current toll collection causes traffic bottlenecks and revenue leakage due to manual cash handling.',
            solution: 'Install RFID readers and ANPR cameras for seamless toll collection without stopping, integrated with mobile payment platforms.',
            costBenefit: 'Deployment cost of KES 100M with projected 30 % increase in toll revenue and 50 % reduction in congestion at toll plazas.',
            categorySlug: 'revenue-generation',
            author: $this->peter,
        );
        $this->awardPoints($pointAwardService, $this->peter);

        /* ──────────────────────────────────────────────────
           Idea 6 — Rainwater Harvesting on Highway Bridges
           Draft (not yet submitted)
           ────────────────────────────────────────────────── */
        $idea6 = Idea::create([
            'title' => 'Rainwater Harvesting on Highway Bridges',
            'slug' => 'rainwater-harvesting',
            'description' => 'Capture and store rainwater from bridge decks for irrigation of road-adjacent green areas and landscaping.',
            'category_id' => $this->categories['climate-resilience'],
            'author_id' => $this->samuel->id,
            'problem_statement' => 'Highway bridges have large surface areas that shed rainwater as runoff, causing erosion and wasting water.',
            'proposed_solution' => 'Install gutter systems and storage tanks on bridges to capture rainwater for landscaping and emergency use.',
            'cost_benefit_analysis' => 'Installation cost of KES 2M per bridge with long-term landscaping savings and environmental benefits.',
            'collaboration_enabled' => true,
            'status' => 'draft',
        ]);
        $idea6->assignRole($this->samuel, 'author');

        /* ──────────────────────────────────────────────────
           Idea 7 — GIS-Based Road Asset Inventory
           Assigned, pending classification
           ────────────────────────────────────────────────── */
        $idea7 = $this->createIdea(
            title: 'GIS-Based Road Asset Inventory',
            slug: 'gis-road-asset',
            description: 'Comprehensive GIS database of all KeNHA road assets including pavements, bridges, culverts, and signage.',
            problem: 'Lack of centralized asset database leads to poor maintenance planning and budget allocation.',
            solution: 'Develop a GIS platform with mobile data collection for field crews to inventory and update all road assets.',
            costBenefit: 'System cost of KES 15M with projected 25 % improvement in maintenance budget utilization.',
            categorySlug: 'value-for-money',
            author: $this->faith,
        );
        $this->awardPoints($pointAwardService, $this->faith);
        $assignmentService->assign($idea7, $this->officer, $this->admin);

        /* ──────────────────────────────────────────────────
           Idea 8 — Drone-Based Construction Monitoring
           Classified, pending DG decision
           ────────────────────────────────────────────────── */
        $idea8 = $this->createIdea(
            title: 'Drone-Based Construction Site Monitoring',
            slug: 'drone-site-monitoring',
            description: 'Use of drones with high-resolution cameras and photogrammetry for monitoring construction progress and quality.',
            problem: 'Current site monitoring methods are manual, time-consuming, and provide limited coverage of large construction sites.',
            solution: 'Deploy drones for weekly aerial surveys of construction sites with automated progress reports and 3D model generation.',
            costBenefit: 'Equipment and training cost of KES 12M with 60 % reduction in monitoring time and improved quality assurance.',
            categorySlug: 'quality-and-safety',
            author: $this->peter,
        );
        $this->awardPoints($pointAwardService, $this->peter);
        $assignmentService->assign($idea8, $this->officer, $this->admin);
        $classificationService->classify($idea8, $this->officer, $innovation, [
            'notes' => 'Innovation in construction monitoring.',
        ]);

        /* ──────────────────────────────────────────────────
           Idea 9 — Edible Cutlery at KeNHA Cafeterias
           Outside Mandate → Closed
           ────────────────────────────────────────────────── */
        $idea9 = $this->createIdea(
            title: 'Edible Cutlery at KeNHA Cafeterias',
            slug: 'edible-cutlery-cafeteria',
            description: 'Replace plastic cutlery in KeNHA cafeterias with edible alternatives made from millet and rice flour.',
            problem: 'Plastic waste from cafeteria cutlery contributes to environmental pollution.',
            solution: 'Partner with local manufacturers to supply edible cutlery made from locally sourced millet and rice flour.',
            costBenefit: 'Minimal additional cost per unit compared to plastic cutlery with significant environmental impact reduction.',
            categorySlug: 'other',
            author: $this->grace,
        );
        $this->awardPoints($pointAwardService, $this->grace);
        $assignmentService->assign($idea9, $this->officer, $this->admin);
        $classificationService->classify($idea9, $this->officer, $outsideMandate, [
            'notes' => 'This does not fall within KeNHA statutory mandate on road infrastructure.',
        ]);
        $decisionService->decide($idea9, $this->dg, 'closed', 'This idea does not fall within KeNHA statutory functions. Referred to relevant government agencies.');

        /* ──────────────────────────────────────────────────
           Idea 10 — PPP Model for Road Maintenance
           Project → Deferred
           ────────────────────────────────────────────────── */
        $idea10 = $this->createIdea(
            title: 'Public-Private Partnership Model for Road Maintenance',
            slug: 'ppp-road-maintenance',
            description: 'A PPP framework where private companies finance road maintenance in exchange for advertising rights and service area concessions.',
            problem: 'Insufficient government budget allocation for timely road maintenance across the network.',
            solution: 'Create a PPP framework with performance-based contracts where private partners maintain road sections and recoup investment through commercial concessions.',
            costBenefit: 'Pilot on 200km section with KES 500M private investment potential against KES 200M annual maintenance cost.',
            categorySlug: 'value-for-money',
            author: $this->samuel,
        );
        $this->awardPoints($pointAwardService, $this->samuel);
        $assignmentService->assign($idea10, $this->officer, $this->admin);
        $classificationService->classify($idea10, $this->officer, $project, [
            'notes' => 'Capital-intensive project requiring Board approval and legal framework development.',
        ]);
        $decisionService->decide($idea10, $this->dg, 'deferred', 'Deferred pending legal review of PPP framework and board guidance.');

        /* ──────────────────────────────────────────────────
           Idea 11 — Green Highway Corridors
           Innovation → Approved → Completed
           ────────────────────────────────────────────────── */
        $idea11 = $this->createIdea(
            title: 'Green Highway Corridors with Native Vegetation',
            slug: 'green-highway-corridors',
            description: 'Landscaping highway corridors with native drought-resistant vegetation to reduce erosion and improve aesthetics.',
            problem: 'Highway slopes and medians are prone to erosion and require high-maintenance landscaping.',
            solution: 'Plant native grass species and drought-resistant shrubs along highway corridors using hydroseeding and drip irrigation from harvested rainwater.',
            costBenefit: 'Planting cost of KES 1.5M per km vs current KES 3M per km for conventional landscaping, plus reduced watering needs.',
            categorySlug: 'climate-resilience',
            author: $this->faith,
        );
        $this->awardPoints($pointAwardService, $this->faith);
        $assignmentService->assign($idea11, $this->officer, $this->admin);
        $classificationService->classify($idea11, $this->officer, $innovation, [
            'notes' => 'Innovation in climate-resilient infrastructure landscaping.',
        ]);
        $decisionService->decide($idea11, $this->dg, 'approved', 'Approved. Cost-effective and environmentally beneficial.');
        $decisionService->progress($idea11, $this->dg, 'Implementation started on Nairobi-Mombasa highway corridor.');
        $decisionService->progress($idea11, $this->dg, 'Planting completed on 50km section. Monitoring phase underway.');

        /* ──────────────────────────────────────────────────
           Idea 12 — Real-Time Traffic Data Dashboard
           Innovation → Declined
           ────────────────────────────────────────────────── */
        $idea12 = $this->createIdea(
            title: 'Real-Time Traffic Data Dashboard',
            slug: 'traffic-data-dashboard',
            description: 'Public-facing dashboard showing real-time traffic conditions, road closures, and estimated travel times.',
            problem: 'Road users lack information about traffic conditions leading to poor route planning and congestion.',
            solution: 'Aggregate traffic data from various sources into a web and mobile dashboard for public access.',
            costBenefit: 'Development cost of KES 10M with annual maintenance of KES 2M.',
            categorySlug: 'customer-delivery-service',
            author: $this->grace,
        );
        $this->awardPoints($pointAwardService, $this->grace);
        $assignmentService->assign($idea12, $this->officer, $this->admin);
        $classificationService->classify($idea12, $this->officer, $innovation, [
            'notes' => 'Innovation in customer service delivery.',
        ]);
        $decisionService->decide($idea12, $this->dg, 'declined', 'Duplicate of ongoing Kenya Roads Board initiative. Not approved.');

        /* ────────────────────────────
           Collaboration Requests
           ──────────────────────────── */

        CollaborationRequest::create([
            'idea_id' => $idea6->id,
            'user_id' => $this->faith->id,
            'message' => 'I have experience with rainwater harvesting systems at KeNHA facilities. I would love to contribute.',
            'status' => 'pending',
        ]);

        CollaborationRequest::create([
            'idea_id' => $idea7->id,
            'user_id' => $this->peter->id,
            'message' => 'I have GIS expertise from my previous projects. Can I help with the GIS implementation?',
            'status' => 'approved',
            'reviewed_by' => $this->faith->id,
            'feedback' => 'Welcome to the team! Your GIS experience will be valuable.',
        ]);

        CollaborationRequest::create([
            'idea_id' => $idea8->id,
            'user_id' => $this->grace->id,
            'message' => 'I am a licensed drone pilot and can handle the drone operations component.',
            'status' => 'pending',
        ]);

        CollaborationRequest::create([
            'idea_id' => $idea11->id,
            'user_id' => $this->samuel->id,
            'message' => 'I have a background in environmental science and sustainable landscaping.',
            'status' => 'rejected',
            'reviewed_by' => $this->faith->id,
            'feedback' => 'Thank you for your interest, but we have sufficient capacity at this time.',
        ]);

        /* ────────────────────────────
           Change Requests
           ──────────────────────────── */

        ChangeRequest::create([
            'idea_id' => $idea5->id,
            'user_id' => $this->samuel->id,
            'proposed_data' => [
                ['field' => 'title', 'current' => 'Toll Collection Optimization', 'proposed' => 'Multi-Lane Free-Flow Toll Collection System'],
            ],
            'notes' => 'The new title better describes the technical scope of the idea.',
            'status' => 'pending',
        ]);

        ChangeRequest::create([
            'idea_id' => $idea7->id,
            'user_id' => $this->peter->id,
            'proposed_data' => [
                ['field' => 'description', 'current' => 'Comprehensive GIS database of all KeNHA road assets including pavements, bridges, culverts, and signage.', 'proposed' => 'Comprehensive GIS database of all KeNHA road assets including pavements, bridges, culverts, signage, and roadside facilities.'],
            ],
            'notes' => 'Adding roadside facilities to the asset inventory scope.',
            'status' => 'pending',
        ]);

        ChangeRequest::create([
            'idea_id' => $idea->id,
            'user_id' => $this->grace->id,
            'proposed_data' => [
                ['field' => 'cost_benefit_analysis', 'current' => 'Initial deployment cost of KES 50M vs projected annual savings of KES 200M in reduced fuel consumption and travel time.', 'proposed' => 'Initial deployment cost of KES 50M vs projected annual savings of KES 200M in reduced fuel consumption and travel time. Additional KES 10M annual maintenance cost included.'],
            ],
            'notes' => 'Updated cost-benefit to include ongoing maintenance costs.',
            'status' => 'approved',
            'reviewed_by' => $this->peter->id,
            'feedback' => 'Good catch. Approved.',
        ]);
    }

    private function createIdea(
        string $title,
        string $slug,
        string $description,
        string $problem,
        string $solution,
        string $costBenefit,
        string $categorySlug,
        User $author,
    ): Idea {
        $idea = Idea::create([
            'title' => $title,
            'slug' => $slug,
            'description' => $description,
            'category_id' => $this->categories[$categorySlug],
            'author_id' => $author->id,
            'problem_statement' => $problem,
            'proposed_solution' => $solution,
            'cost_benefit_analysis' => $costBenefit,
            'collaboration_enabled' => true,
            'status' => 'submitted',
        ]);

        $idea->assignRole($author, 'author');

        return $idea;
    }

    private function awardPoints(PointAwardService $service, User $user): void
    {
        if ($this->ideaSubmissionPoint !== null && $this->ideaSubmissionPoint->is_active) {
            $service->award($user, $this->ideaSubmissionPoint);
        }
    }
}
