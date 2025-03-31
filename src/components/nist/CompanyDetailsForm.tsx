
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  industry: z.string().min(1, { message: 'Please select an industry.' }),
  location: z.string().min(2, { message: 'Location must be at least 2 characters.' }),
  employeeCount: z.string().min(1, { message: 'Please select employee count.' }),
  hasSecurityTeam: z.enum(['yes', 'no', 'partial']),
  securityTeamSize: z.string().optional(),
});

interface CompanyDetailsFormProps {
  initialData: any;
  onSave: (data: any) => void;
}

const CompanyDetailsForm: React.FC<CompanyDetailsFormProps> = ({ initialData, onSave }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      companyName: '',
      industry: '',
      location: '',
      employeeCount: '',
      hasSecurityTeam: 'no',
      securityTeamSize: '',
    },
  });

  const hasSecurityTeam = form.watch('hasSecurityTeam');

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSave(data);
  };

  // Auto-save on field change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      if (Object.values(value).some(v => v)) {
        onSave(value);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onSave]);

  const industries = [
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'technology', label: 'Technology' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'government', label: 'Government' },
    { value: 'education', label: 'Education' },
    { value: 'energy', label: 'Energy & Utilities' },
    { value: 'telecommunications', label: 'Telecommunications' },
    { value: 'other', label: 'Other' },
  ];

  const employeeRanges = [
    { value: '1-50', label: '1-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1001-5000', label: '1001-5000 employees' },
    { value: '5001+', label: '5001+ employees' },
  ];

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card className="border border-cyber-blue/10 bg-cyber-gray-900/50">
          <CardHeader>
            <CardTitle className="text-xl text-cyber-blue">Company Information</CardTitle>
            <CardDescription>
              Provide details about your organization to customize the assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry.value} value={industry.value}>
                            {industry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="employeeCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Size</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employeeRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasSecurityTeam"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Do you have a dedicated security team?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Yes, we have a dedicated team
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="partial" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Partial (shared responsibilities)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          No dedicated security personnel
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(hasSecurityTeam === 'yes' || hasSecurityTeam === 'partial') && (
              <FormField
                control={form.control}
                name="securityTeamSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Team Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 people</SelectItem>
                        <SelectItem value="6-15">6-15 people</SelectItem>
                        <SelectItem value="16-30">16-30 people</SelectItem>
                        <SelectItem value="30+">30+ people</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default CompanyDetailsForm;
