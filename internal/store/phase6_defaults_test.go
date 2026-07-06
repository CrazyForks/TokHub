package store

import (
	"strings"
	"testing"
)

func TestDefaultFeaturedRecommendPicksAreRecommendationOnly(t *testing.T) {
	picks := defaultFeaturedRecommendPicks()
	if len(picks) != 3 {
		t.Fatalf("expected 3 default recommendation picks, got %d", len(picks))
	}
	for _, pick := range picks {
		if pick.ChannelID != "" {
			t.Fatalf("default pick %s must not reference a platform channel", pick.ID)
		}
		if pick.Channel.ID != "" {
			t.Fatalf("default pick %s must not expose a platform channel id", pick.ID)
		}
		if strings.TrimSpace(pick.Title) == "" || strings.TrimSpace(pick.CTAURL) == "" {
			t.Fatalf("default pick %s must include title and cta url", pick.ID)
		}
		if !strings.HasPrefix(pick.CTAURL, "https://") {
			t.Fatalf("default pick %s must link to an external official entry", pick.ID)
		}
	}
}
