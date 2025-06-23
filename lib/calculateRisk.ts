type HazardData = {
  id: number
  name: string
  probability: number
  alerts: number
  activations: number
  humanImpact: number
  propertyImpact: number
  businessImpact: number
  preparedness: number
  internalResponse: number
  externalResponse: number
}

export function calculateRiskScores(hazards: HazardData[]) {
  const hazardsWithScores = hazards.map((hazard) => {
    // Skip calculation if probability is 0 (N/A)
    if (hazard.probability === 0) {
      return { ...hazard, score: 0 }
    }

    // Calculate likelihood score (probability + alerts + activations)
    const likelihoodScore = hazard.probability + Math.min(hazard.alerts, 3) + Math.min(hazard.activations, 3)

    // Calculate impact score (human + property + business)
    const impactScore = hazard.humanImpact + hazard.propertyImpact + hazard.businessImpact

    // Calculate response score (preparedness + internal + external)
    // Note: For response, higher values are better, so we invert the scale (3 - value)
    const responseScore = 3 - hazard.preparedness + (3 - hazard.internalResponse) + (3 - hazard.externalResponse)

    // Calculate total risk score
    // Formula: (Likelihood * Impact) + Response
    const score = likelihoodScore * impactScore + responseScore

    return { ...hazard, score: Math.max(0, score) }
  })

  // Sort hazards by score (descending)
  const sortedHazards = [...hazardsWithScores].sort((a, b) => b.score - a.score)

  // Get top 10 risks for chart
  const topRisks = sortedHazards
    .filter((h) => h.score > 0)
    .slice(0, 10)
    .map((h) => ({ name: h.name, score: h.score }))

  // Calculate overall preparedness level
  const avgPreparedness = calculateAveragePreparedness(hazards)
  let overallPreparedness = "Unknown"

  if (avgPreparedness >= 2.5) {
    overallPreparedness = "Good - The organization is well-prepared for most hazards."
  } else if (avgPreparedness >= 1.5) {
    overallPreparedness = "Fair - The organization has moderate preparedness for hazards."
  } else if (avgPreparedness > 0) {
    overallPreparedness = "Poor - The organization needs significant improvement in preparedness."
  }

  return {
    hazardsWithScores: sortedHazards,
    topRisks,
    overallPreparedness,
  }
}

function calculateAveragePreparedness(hazards: HazardData[]) {
  const relevantHazards = hazards.filter((h) => h.probability > 0)

  if (relevantHazards.length === 0) {
    return 0
  }

  const totalPreparedness = relevantHazards.reduce((sum, hazard) => {
    return sum + hazard.preparedness + hazard.internalResponse + hazard.externalResponse
  }, 0)

  return totalPreparedness / (relevantHazards.length * 3)
}
