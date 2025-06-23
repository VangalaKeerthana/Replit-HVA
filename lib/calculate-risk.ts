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
    // Ensure all values are valid numbers
    const probability = isNaN(hazard.probability) ? 0 : hazard.probability
    const alerts = isNaN(hazard.alerts) ? 0 : hazard.alerts
    const activations = isNaN(hazard.activations) ? 0 : hazard.activations
    const humanImpact = isNaN(hazard.humanImpact) ? 0 : hazard.humanImpact
    const propertyImpact = isNaN(hazard.propertyImpact) ? 0 : hazard.propertyImpact
    const businessImpact = isNaN(hazard.businessImpact) ? 0 : hazard.businessImpact
    const preparedness = isNaN(hazard.preparedness) ? 0 : hazard.preparedness
    const internalResponse = isNaN(hazard.internalResponse) ? 0 : hazard.internalResponse
    const externalResponse = isNaN(hazard.externalResponse) ? 0 : hazard.externalResponse

    // Skip calculation if probability is 0 (N/A)
    if (probability === 0) {
      return { ...hazard, score: 0 }
    }

    // Calculate likelihood score (probability + alerts + activations)
    const likelihoodScore = probability + Math.min(alerts, 3) + Math.min(activations, 3)

    // Calculate impact score (human + property + business)
    const impactScore = humanImpact + propertyImpact + businessImpact

    // Calculate response score (preparedness + internal + external)
    // Note: For response, higher values are better, so we invert the scale (3 - value)
    const responseScore = 3 - preparedness + (3 - internalResponse) + (3 - externalResponse)

    // Calculate total risk score
    // Formula: (Likelihood * Impact) + Response
    const score = likelihoodScore * impactScore + responseScore

    // Ensure score is a valid number
    const safeScore = isNaN(score) ? 0 : score

    return { ...hazard, score: safeScore }
  })

  // Sort hazards by score (descending)
  const sortedHazards = [...hazardsWithScores].sort((a, b) => {
    const scoreA = isNaN(a.score) ? 0 : a.score
    const scoreB = isNaN(b.score) ? 0 : b.score
    return scoreB - scoreA
  })

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
  const relevantHazards = hazards.filter((h) => {
    const probability = isNaN(h.probability) ? 0 : h.probability
    return probability > 0
  })

  if (relevantHazards.length === 0) {
    return 0
  }

  const totalPreparedness = relevantHazards.reduce((sum, hazard) => {
    const preparedness = isNaN(hazard.preparedness) ? 0 : hazard.preparedness
    const internalResponse = isNaN(hazard.internalResponse) ? 0 : hazard.internalResponse
    const externalResponse = isNaN(hazard.externalResponse) ? 0 : hazard.externalResponse

    return sum + preparedness + internalResponse + externalResponse
  }, 0)

  return totalPreparedness / (relevantHazards.length * 3)
}
