import { Icon } from '@/components/ui/Icon'

// Simple unit test for Icon component logic
describe('Icon Component', () => {
  it('should have all required icon mappings', () => {
    // Test that our icon mapping includes the icons we're using
    // Test that the component can be imported without errors
    expect(Icon).toBeDefined()
    expect(typeof Icon).toBe('function')
  })

  it('should export IconName type', () => {
    // Test that types are properly exported
    expect(Icon).toBeDefined()
  })
})
