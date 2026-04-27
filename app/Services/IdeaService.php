<?php

namespace App\Services;

use App\Models\Idea;
use App\Models\ThematicArea;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class IdeaService
{
    public function getPaginatedForUser(int $userId, array $filters = []): LengthAwarePaginator
    {
        $query = Idea::with(['thematicArea', 'user'])
            ->where('user_id', $userId);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['thematic_area_id'])) {
            $query->where('thematic_area_id', $filters['thematic_area_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    public function getPublicIndex(array $filters = []): array
    {
        $query = Idea::with(['thematicArea', 'user'])
            ->where('status', '!=', 'draft');

        if (! empty($filters['thematic_area_id'])) {
            $query->where('thematic_area_id', $filters['thematic_area_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $ideas = $query->orderBy('created_at', 'desc')->paginate(15);
        $thematicAreas = ThematicArea::where('is_active', true)->orderBy('sort_order')->get();

        return [
            'ideas' => $ideas,
            'thematicAreas' => $thematicAreas,
        ];
    }

    public function create(array $data, int $userId): Idea
    {
        return DB::transaction(function () use ($data, $userId) {
            $data['user_id'] = $userId;
            $data['slug'] = $data['slug'] ?? \Str::slug($data['idea_title']);
            $data['path'] = 'idea/'.$data['slug'];

            if (isset($data['attachment'])) {
                $path = $this->storeAttachment($data['attachment']);
                $data['attachment'] = $path;
            }

            return Idea::create($data);
        });
    }

    public function update(Idea $idea, array $data): Idea
    {
        return DB::transaction(function () use ($idea, $data) {
            if (isset($data['attachment'])) {
                if ($idea->attachment) {
                    Storage::disk('public')->delete($idea->attachment);
                }
                $path = $this->storeAttachment($data['attachment']);
                $data['attachment'] = $path;
            }

            $idea->update($data);

            return $idea->fresh();
        });
    }

    public function delete(Idea $idea): void
    {
        DB::transaction(function () use ($idea) {
            if ($idea->attachment) {
                Storage::disk('public')->delete($idea->attachment);
            }
            $idea->delete();
        });
    }

    public function findById(int $id): ?Idea
    {
        return Idea::with(['thematicArea', 'user', 'comments.user', 'smeReviews', 'ddReviews'])->find($id);
    }

    protected function storeAttachment($file): string
    {
        return Storage::disk('public')->put('ideas/attachments', $file);
    }
}
