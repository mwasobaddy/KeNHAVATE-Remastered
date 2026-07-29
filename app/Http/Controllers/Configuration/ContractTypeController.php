<?php

namespace App\Http\Controllers\Configuration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\StoreContractTypeRequest;
use App\Http\Requests\Configuration\UpdateContractTypeRequest;
use App\Models\ContractType;
use App\Services\Configuration\ContractTypeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ContractTypeController extends Controller
{
    public function __construct(
        private ContractTypeService $contractTypeService,
    ) {}

    public function index(Request $request): Response
    {
        return inertia('configuration/contract-types/index', [
            'contract_types' => $this->contractTypeService->list(
                $request->get('search', ''),
                $request->only(['search']),
            ),
            'filters' => $request->only(['search']),
            'search' => $request->get('search', ''),
        ]);
    }

    public function create(): Response
    {
        return inertia('configuration/contract-types/create');
    }

    public function store(StoreContractTypeRequest $request): RedirectResponse
    {
        $this->contractTypeService->create($request->validated());

        return redirect()->route('contract-types.index')
            ->with('success', 'Contract type created successfully.');
    }

    public function edit(ContractType $contractType): Response
    {
        return inertia('configuration/contract-types/edit', [
            'contractType' => $contractType,
        ]);
    }

    public function update(UpdateContractTypeRequest $request, ContractType $contractType): RedirectResponse
    {
        $this->contractTypeService->update($contractType, $request->validated());

        return redirect()->route('contract-types.index')
            ->with('success', 'Contract type updated successfully.');
    }

    public function destroy(ContractType $contractType): RedirectResponse
    {
        $this->contractTypeService->delete($contractType);

        return redirect()->route('contract-types.index')
            ->with('success', 'Contract type deleted successfully.');
    }
}
